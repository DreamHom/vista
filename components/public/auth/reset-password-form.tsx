"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { AUTH_INPUT_CHROME, passwordStrengthLabel } from "./auth-shared";

export function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strength = useMemo(() => passwordStrengthLabel(password), [password]);

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
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We could not reset your password. The link may have expired.");
      }
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
          className={AUTH_INPUT_CHROME}
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
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} size="lg" className={AUTH_INPUT_CHROME} required />
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
          className={AUTH_INPUT_CHROME}
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
