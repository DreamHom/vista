"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import type { MeResponse, Role } from "@/lib/api/types";

const ROLE_HOME: Record<Role, string> = {
  APPLICANT: "/dashboard",
  OWNER: "/owner",
  AGENT: "/agent",
  ADMIN: "/admin",
};

export function LoginForm({ nextHref }: { nextHref?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const problem = await res.json().catch(() => ({}));
          if (res.status === 401) {
            setError("Wrong email or password.");
          } 
          else {
            setError(
              problem?.detail ?? problem?.title ?? "Could not sign you in.",
            );
          }
          return;
        }
        const data = (await res.json()) as { user: MeResponse };
        const dest = nextHref ?? ROLE_HOME[data.user.role] ?? "/dashboard";
        router.replace(dest);
        router.refresh();
      } 
      catch {
        setError("Network error — try again in a moment.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </div>
      ) : null}
      <Field label="Email">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </Field>
      <Field
        label="Password"
        trailing={
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand hover:text-brand-hover"
          >
            Forgot password?
          </Link>
        }
      >
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={pending}
        trailingIcon={<Icon.ArrowRight size={16} />}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}