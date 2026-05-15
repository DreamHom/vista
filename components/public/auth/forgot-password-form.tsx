"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import type { ForgotPasswordResponse } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { AUTH_INPUT_CHROME } from "./auth-shared";

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
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("We could not start a reset right now. Try again shortly.");
      }
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
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} size="lg" className={AUTH_INPUT_CHROME} required />
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
