"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Icon } from "@/components/icons";
import type { Role } from "@/lib/api/types";

interface Props {
  role: Role;

  extraFields?: React.ReactNode;

  ctaLabel?: string;
}

export function RegisterForm({ role, extraFields, ctaLabel }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = new FormData(e.currentTarget);
    const first = String(form.get("firstName") ?? "").trim();
    const last = String(form.get("lastName") ?? "").trim();
    const fullName = `${first} ${last}`.trim();
    const payload = {
      role,
      fullName,
      displayName: first || undefined,
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      phone: (form.get("phone") as string) || undefined,
    };

    if (!payload.email || !payload.password || !fullName) {
      setError("Name, email and password are required.");
      return;
    }
    if (payload.password.length < 10) {
      setError("Use at least 10 characters for your password.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok && res.status !== 202) {
          setError(
            data?.detail ??
              data?.title ??
              "Could not create your account just now.",
          );
          return;
        }
        setSuccess(
          data?.message ??
            "If this email is new to DreamHomes, check your inbox to finish setting up.",
        );
        (e.target as HTMLFormElement).reset();
      } 
      catch {
        setError("Network error — please try again.");
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
      {success ? (
        <div
          role="status"
          className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {success}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name">
          <Input name="firstName" placeholder="Daniel" required />
        </Field>
        <Field label="Last name">
          <Input name="lastName" placeholder="Olatunji" required />
        </Field>
      </div>
      <Field label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </Field>
      <Field label="Phone (optional)">
        <Input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+234…"
        />
      </Field>
      <Field label="Password" hint="At least 10 characters; mix it up.">
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          minLength={10}
        />
      </Field>
      {extraFields}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={pending}
        trailingIcon={<Icon.ArrowRight size={16} />}
      >
        {pending ? "Creating account…" : (ctaLabel ?? "Create account")}
      </Button>
    </form>
  );
}
