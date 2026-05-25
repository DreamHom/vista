"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import { loadSessionUserWithAvatar } from "@/lib/auth-hydrate-user";
import { useAuthStore } from "@/lib/auth-store";
import { ROLES, type LoginResponse, type Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { getDefaultDashboardPath } from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";
import { AUTH_INPUT_CHROME } from "./auth-shared";

function normalizeRole(value: unknown): Role | null {
  if (typeof value !== "string") return null;
  const normalized = value.toUpperCase();
  return ROLES.includes(normalized as Role) ? (normalized as Role) : null;
}

function normalizeLoginResponse(value: unknown): LoginResponse | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const tokenCandidate = candidate.token ?? candidate.accessToken ?? candidate.jwt;
  const rawUserId = candidate.userId ?? candidate.sub ?? candidate.id;
  const userCandidate =
    candidate.user && typeof candidate.user === "object"
      ? (candidate.user as Record<string, unknown>)
      : null;
  const role = normalizeRole(candidate.role ?? userCandidate?.role);
  const fullNameCandidate = candidate.fullName ?? userCandidate?.fullName ?? userCandidate?.name;

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

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const hydrated = useAuthStore((state) => state.hydrated);
  const storedToken = useAuthStore((state) => state.token);
  const storedUser = useAuthStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const response = await api.post<unknown>(
        "/auth/login",
        { email, password },
        { skipAuth: true },
      );
      const normalized = normalizeLoginResponse(response);
      if (normalized) {
        setSession(normalized.token, {
          id: me.id,
          fullName: normalized.fullName,
          role: normalized.role,
        });
        toast.success("Signed in successfully.");
        router.push(next ?? getDefaultDashboardPath(normalized.role));
        return;
      }

      const me = await loadSessionUserWithAvatar();
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
      const message = apiErrorMessage(err, "We could not log you in right now.");
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
            className={AUTH_INPUT_CHROME}
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
              className={cn(AUTH_INPUT_CHROME, "pr-12")}
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
