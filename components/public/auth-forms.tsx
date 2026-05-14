"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  IdCard,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type {
  LoginResponse,
  PublicRole,
  RegisterAcceptedResponse,
  RegisterRequest,
} from "@/lib/types";
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
      toast.success("Account request accepted.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We could not submit your registration right now.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="border border-primary/25 bg-primary/[0.06] p-6 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold tracking-tight">{success.message}</p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{success.nextStep}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-none")}
          >
            Continue to sign in
          </Link>
          <Link href="/listings" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
            Browse listings
          </Link>
        </div>
      </div>
    );
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
              <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
              Phone
            </span>
            <Input
              type="tel"
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        { email, password },
        { skipAuth: true },
      );

      setSession(response.token, {
        id: response.userId,
        fullName: response.fullName,
        role: response.role,
      });
      toast.success("Signed in successfully.");
      router.push(next ?? getDefaultDashboardPath(response.role));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We could not log you in right now.");
      }
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

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold" disabled={loading}>
        {loading ? "Signing you in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="space-y-5">
        <div className="border border-primary/25 bg-primary/[0.06] p-5 text-sm text-foreground">
          Check your email for a reset link.
        </div>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-none")}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      className="space-y-5"
    >
      <label className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="h-4 w-4 text-primary" aria-hidden />
          Email
        </span>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} size="lg" className={inputChrome} required />
      </label>

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold">
        Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strength = useMemo(() => strengthLabel(password), [password]);

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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        setError(null);
        setSubmitted(true);
      }}
      className="space-y-5"
    >
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

      <Button type="submit" size="lg" className="h-12 w-full rounded-none text-base font-semibold">
        Reset password
      </Button>
    </form>
  );
}
