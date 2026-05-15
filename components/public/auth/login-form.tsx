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
import type { LoginResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { getDefaultDashboardPath } from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";
import { AUTH_INPUT_CHROME } from "./auth-shared";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const hydrated = useAuthStore((state) => state.hydrated);
  const storedToken = useAuthStore((state) => state.token);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !storedToken) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await loadSessionUserWithAvatar();
        if (cancelled) return;
        setSession(storedToken, {
          id: me.id,
          fullName: me.fullName,
          role: me.role,
          email: me.email,
          profileImageUrl: me.profileImageUrl,
        });
        router.replace(next ?? getDefaultDashboardPath(me.role));
      } catch {
        /* stale token — stay on login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, storedToken, next, router, setSession]);

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
