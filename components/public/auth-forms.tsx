"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  IdCard,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { ApiError, api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import { loadSessionUserWithAvatar } from "@/lib/auth-hydrate-user";
import { useAuthStore } from "@/lib/auth-store";
import type {
  ForgotPasswordResponse,
  LoginResponse,
  PublicRole,
  RegisterAcceptedResponse,
  RegisterRequest,
  Role,
} from "@/lib/types";
import { ROLES } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { getDefaultDashboardPath } from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: Array<{
  value: PublicRole;
  title: string;
  body: string;
  icon: LucideIcon;
  perks: readonly string[];
}> = [
  {
    value: "APPLICANT",
    title: "I want to find a home",
    body: "Search, shortlist, compare, and book viewings with context carried through every step.",
    icon: Home,
    perks: [
      "Shortlists and Dream AI threads stay on your account",
      "Inspection requests stay documented for agents and owners",
      "One login for renter and buyer journeys",
    ],
  },
  {
    value: "OWNER",
    title: "I want to list my property",
    body: "Publish, verify, and manage serious interest without losing control of your asset.",
    icon: Building2,
    perks: [
      "Owner dashboard tuned for listings and verification",
      "Optional agent assignment with a clear audit trail",
      "Leads, offers, and inspections in one place",
    ],
  },
  {
    value: "AGENT",
    title: "I am a real estate agent",
    body: "Show verified credentials, build trust from real reviews, and keep deals on-platform.",
    icon: Briefcase,
    perks: [
      "Public profile tied to review and activity history",
      "Credential checks you can surface to clients",
      "Pipeline-friendly tools as Haven grows",
    ],
  },
];

type AuthDiagnostics = {
  responseKeys: string[];
  tokenFound: boolean;
  tokenSource: string;
  normalizedPayload: boolean;
  meCheck: "not-run" | "success" | "unauthenticated" | "failed";
};

function getObjectKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value as Record<string, unknown>).sort();
}

const AUTH_SESSION_NOT_ESTABLISHED = "AUTH_SESSION_NOT_ESTABLISHED";

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== "string") return null;
  const normalized = value.toUpperCase();
  return ROLES.includes(normalized as Role) ? (normalized as Role) : null;
}

function extractTokenFromLoginResponse(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const direct =
    candidate.token ??
    candidate.accessToken ??
    candidate.access_token ??
    candidate.idToken ??
    candidate.id_token ??
    candidate.jwt;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const nestedKeys = ["data", "payload", "result", "auth"];
  for (const key of nestedKeys) {
    const nested = candidate[key];
    if (!nested || typeof nested !== "object") continue;
    const nestedObj = nested as Record<string, unknown>;
    const token =
      nestedObj.token ??
      nestedObj.accessToken ??
      nestedObj.access_token ??
      nestedObj.idToken ??
      nestedObj.id_token ??
      nestedObj.jwt;
    if (typeof token === "string" && token.trim()) return token.trim();
  }
  return null;
}

function normalizeLoginResponse(value: unknown): LoginResponse | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const tokenCandidate = extractTokenFromLoginResponse(candidate);
  const userCandidate =
    candidate.user && typeof candidate.user === "object"
      ? (candidate.user as Record<string, unknown>)
      : null;
  const rawUserId = candidate.userId ?? candidate.user_id ?? candidate.sub ?? candidate.id ?? userCandidate?.userId ?? userCandidate?.user_id ?? userCandidate?.id;
  const role = normalizeRole(candidate.role ?? userCandidate?.role ?? userCandidate?.userRole);
  const fullNameCandidate = candidate.fullName ?? candidate.full_name ?? userCandidate?.fullName ?? userCandidate?.full_name ?? userCandidate?.name;

  const token = typeof tokenCandidate === "string" ? tokenCandidate : null;
  const userId =
    typeof rawUserId === "number"
      ? rawUserId
      : typeof rawUserId === "string" && rawUserId.trim() && Number.isFinite(Number(rawUserId))
        ? Number(rawUserId)
        : null;
  const fullName = typeof fullNameCandidate === "string" && fullNameCandidate.trim() ? fullNameCandidate.trim() : null;

  if (!token || userId == null || !role || !fullName) return null;
  return {
    token,
    tokenType: typeof candidate.tokenType === "string" ? candidate.tokenType : "Bearer",
    expiresInSeconds: typeof candidate.expiresInSeconds === "number" ? candidate.expiresInSeconds : 0,
    userId,
    role,
    fullName,
  };
}

function strengthLabel(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", width: "w-1/4", color: "bg-destructive" };
  if (score === 2) return { label: "Fair", width: "w-2/4", color: "bg-amber-500" };
  if (score === 3) return { label: "Good", width: "w-3/4", color: "bg-primary/70" };
  return { label: "Strong", width: "w-full", color: "bg-primary" };
}

const inputChrome = "rounded-none";

const SIGNUP_SUCCESS_STEPS = [
  "Your account details are saved",
  "Your role and DreamHomes workspace are ready for you",
  "Sign in once to open your dashboard",
] as const;

function SignupSuccessPanel({ next }: { next?: string }) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          You&apos;re in.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          Welcome to DreamHomes. Use the email and password you just chose to sign in and pick up in your dashboard.
        </motion.p>
      </div>

      <ul className="space-y-4" aria-label="What is ready">
        {SIGNUP_SUCCESS_STEPS.map((line, index) => (
          <motion.li
            key={line}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.12 + index * 0.1,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-start gap-3 text-sm leading-snug text-foreground md:text-[0.9375rem]"
          >
            <motion.span
              initial={{ scale: 0, rotate: -35 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.18 + index * 0.1,
                type: "spring",
                stiffness: 520,
                damping: 22,
              }}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary shadow-sm"
              aria-hidden
            >
              <Check className="h-[1.125rem] w-[1.125rem] stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round" />
            </motion.span>
            <span className="pt-1.5">{line}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap gap-3"
      >
        <Link href={loginHref} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none")}>
          Sign in to DreamHomes
        </Link>
        <Link href="/listings" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
          Browse listings
        </Link>
      </motion.div>
    </div>
  );
}

export function SignupForm({
  initialRole,
  next,
}: {
  initialRole: PublicRole;
  next?: string;
}) {
  const [role, setRole] = useState<PublicRole>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<RegisterAcceptedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeRole = useMemo(() => ROLE_OPTIONS.find((r) => r.value === role)!, [role]);
  const passwordStrength = useMemo(() => strengthLabel(password), [password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      setError("You need to accept the Terms and Privacy Policy to continue.");
      return;
    }
    if (role === "AGENT" && !licenseNumber.trim()) {
      setError("Agent registration requires a license number.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: RegisterRequest = {
        fullName,
        email,
        phone,
        password,
        role,
        licenseNumber: role === "AGENT" ? licenseNumber.trim() : undefined,
      };

      const response = await api.post<RegisterAcceptedResponse>("/auth/register", payload, {
        skipAuth: true,
      });

      setSuccess(response);
      toast.success("Welcome to DreamHomes!");
    } catch (err) {
      const message = apiErrorMessage(err, "We could not submit your registration right now.");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <SignupSuccessPanel next={next} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">1. Your role</h2>
          <span className="hidden text-xs text-muted-foreground sm:inline">Tap a card to switch paths</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={cn(
                  "group flex flex-col gap-4 border p-5 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/[0.07] shadow-[inset_0_0_0_1px_rgba(43,124,201,0.2)]"
                    : "border-border bg-background hover:border-foreground/20 hover:bg-secondary/35",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center border transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-foreground group-hover:border-primary/40",
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold tracking-tight text-foreground">{option.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{option.body}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 border border-border bg-secondary/25 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
              What unlocks with this role
            </p>
          </div>
          <ul className="mt-4 space-y-3">
            {activeRole.perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-sm leading-snug text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">2. Account details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-primary" aria-hidden />
              Full name
            </span>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              size="lg"
              className={inputChrome}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="h-4 w-4 text-primary" aria-hidden />
              Email
            </span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              size="lg"
              className={inputChrome}
              required
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              Phone
            </span>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              size="lg"
              className={inputChrome}
              required
            />
          </label>
          {role === "AGENT" ? (
            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <IdCard className="h-4 w-4 text-primary" aria-hidden />
                License number
              </span>
              <Input
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                size="lg"
                className={inputChrome}
                required
              />
            </label>
          ) : null}
          <label className={`flex flex-col gap-2 ${role === "AGENT" ? "" : "sm:col-span-2"}`}>
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="h-4 w-4 text-primary" aria-hidden />
              Password
            </span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              size="lg"
              className={inputChrome}
              required
            />
            {password ? (
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 w-full overflow-hidden bg-secondary">
                  <div className={cn("h-full transition-all", passwordStrength.width, passwordStrength.color)} />
                </div>
                <p className="text-xs text-muted-foreground">Strength: {passwordStrength.label}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
            )}
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="h-4 w-4 text-primary" aria-hidden />
              Confirm password
            </span>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              size="lg"
              className={inputChrome}
              required
            />
          </label>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-4 border border-border bg-secondary/15 p-5 text-sm leading-relaxed text-muted-foreground transition-colors hover:bg-secondary/25">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-primary hover:text-primary/80">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-primary hover:text-primary/80">
            Privacy Policy
          </Link>
          . We only use your details to run verification, safety, and product messaging you can control.
        </span>
      </label>

      {error ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold" disabled={submitting}>
        {submitting ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const storedToken = useAuthStore((state) => state.token);
  const storedUser = useAuthStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<AuthDiagnostics | null>(null);
  const showDiagnostics = process.env.NODE_ENV !== "production";

  useEffect(() => {
    if (!hydrated || (!storedToken && !storedUser)) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await loadSessionUserWithAvatar();
        if (cancelled) return;
        if (storedToken) {
          setSession(storedToken, {
            id: me.id,
            fullName: me.fullName,
            role: me.role,
            email: me.email,
            profileImageUrl: me.profileImageUrl,
          });
        } else {
          setUser({
            id: me.id,
            fullName: me.fullName,
            role: me.role,
            email: me.email,
            profileImageUrl: me.profileImageUrl,
          });
        }
        router.replace(next ?? getDefaultDashboardPath(me.role));
      } catch {
        /* stale auth state — stay on login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, storedToken, storedUser, next, router, setSession, setUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (showDiagnostics) setDiagnostics(null);

    try {
      const loadVerifiedSessionUser = async () => {
        try {
          return await loadSessionUserWithAvatar();
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            throw new Error(AUTH_SESSION_NOT_ESTABLISHED);
          }
          throw error;
        }
      };

      const response = await api.post<unknown>(
        "/auth/login",
        { email, password },
        { skipAuth: true },
      );
      const normalized = normalizeLoginResponse(response);
      const token = extractTokenFromLoginResponse(response);
      if (showDiagnostics) {
        setDiagnostics({
          responseKeys: getObjectKeys(response),
          tokenFound: Boolean(token),
          tokenSource: token ? "top-level-or-known-nested" : "none",
          normalizedPayload: Boolean(normalized),
          meCheck: "not-run",
        });
      }
      if (normalized) {
        setSession(normalized.token, {
          id: normalized.userId,
          fullName: normalized.fullName,
          role: normalized.role,
        });
        toast.success("Signed in successfully.");
        router.push(next ?? getDefaultDashboardPath(normalized.role));
        return;
      }

      if (token) {
        setToken(token);
        const me = await loadVerifiedSessionUser();
        if (showDiagnostics) {
          setDiagnostics((current) =>
            current
              ? {
                  ...current,
                  meCheck: "success",
                }
              : current,
          );
        }
        setSession(token, {
          id: me.id,
          fullName: me.fullName,
          role: me.role,
          email: me.email,
          profileImageUrl: me.profileImageUrl,
        });
        toast.success("Signed in successfully.");
        router.push(next ?? getDefaultDashboardPath(me.role));
        return;
      }

      const me = await loadVerifiedSessionUser();
      if (showDiagnostics) {
        setDiagnostics((current) =>
          current
            ? {
                ...current,
                meCheck: "success",
              }
            : current,
        );
      }
      setUser({
        id: me.id,
        fullName: me.fullName,
        role: me.role,
        email: me.email,
        profileImageUrl: me.profileImageUrl,
      });
      toast.success("Signed in successfully.");
      router.push(next ?? getDefaultDashboardPath(me.role));
    } catch (err) {
      if (showDiagnostics) {
        setDiagnostics((current) => {
          if (!current) return current;
          if (err instanceof ApiError && err.status === 401) {
            return { ...current, meCheck: "unauthenticated" };
          }
          return { ...current, meCheck: "failed" };
        });
      }
      const message =
        err instanceof Error && err.message === AUTH_SESSION_NOT_ESTABLISHED
          ? "Sign-in reached the server, but your local session could not be created. This is usually a local dev cookie/session setup issue."
          : err instanceof ApiError && err.status === 401
          ? "We couldn't sign you in with those details. Check your email and password and try again."
          : err instanceof Error && /unauthenticated|unauthorized/i.test(err.message)
            ? "Your sign-in could not be confirmed. Please check your details and try again."
            : apiErrorMessage(err, "We could not log you in right now.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            Email
          </span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            size="lg"
            className={inputChrome}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            Password
          </span>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              size="lg"
              className={cn(inputChrome, "pr-12")}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </label>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">
            Forgot password?
          </Link>
        </div>
      </div>

      {error ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      ) : null}
      {showDiagnostics && diagnostics ? (
        <div className="border border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Dev auth diagnostics</p>
          <p className="mt-1">response keys: {diagnostics.responseKeys.join(", ") || "(none)"}</p>
          <p>token found: {diagnostics.tokenFound ? "yes" : "no"} ({diagnostics.tokenSource})</p>
          <p>normalized payload: {diagnostics.normalizedPayload ? "yes" : "no"}</p>
          <p>/me check: {diagnostics.meCheck}</p>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold" disabled={loading}>
        {loading ? "Signing you in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="border border-primary/25 bg-primary/[0.06] p-5 text-sm text-foreground">
          If an account exists for that email, password reset instructions will follow. Check your inbox (and spam)
          once email delivery is enabled on the server.
        </div>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
          Back to sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        { email: email.trim() },
        { skipAuth: true },
      );
      if (res?.debugResetToken) {
        toast.message("Development reset token", { description: res.debugResetToken });
      }
      setSent(true);
    } catch (err) {
      const message = apiErrorMessage(err, "We could not start a reset right now. Try again shortly.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="h-4 w-4 text-primary" aria-hidden />
          Email
        </span>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} size="lg" className={inputChrome} required />
      </label>

      {error ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold" disabled={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strength = useMemo(() => strengthLabel(password), [password]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="border border-primary/25 bg-primary/[0.06] p-5 text-sm text-foreground">Your password has been reset successfully.</div>
        <Link href="/login" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none")}>
          Go to sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token.trim()) {
      setError("Reset link is missing a token. Open the link from your email again, or request a new reset.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post<void>("/auth/reset-password", { token: token.trim(), newPassword: password }, { skipAuth: true });
      toast.success("Password updated. You can sign in with the new password.");
      setSubmitted(true);
    } catch (err) {
      const message = apiErrorMessage(err, "We could not reset your password. The link may have expired.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lock className="h-4 w-4 text-primary" aria-hidden />
          Reset token
        </span>
        <Input
          type="text"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          size="lg"
          className={inputChrome}
          placeholder="Paste token from your reset email"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          If your email client opened this page without query parameters, paste the token from the reset link here.
        </p>
      </label>

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lock className="h-4 w-4 text-primary" aria-hidden />
          New password
        </span>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} size="lg" className={inputChrome} required />
      </label>

      <div className="space-y-2">
        <div className="h-1.5 w-full overflow-hidden bg-secondary">
          <div className={cn("h-full transition-all", strength.width, strength.color)} />
        </div>
        <p className="text-xs text-muted-foreground">Password strength: {strength.label}</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lock className="h-4 w-4 text-primary" aria-hidden />
          Confirm new password
        </span>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          size="lg"
          className={inputChrome}
          required
        />
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold" disabled={loading}>
        {loading ? "Updating…" : "Reset password"}
      </Button>
    </form>
  );
}
