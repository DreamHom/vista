"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, IdCard, Lock, Mail, Phone, Sparkles, User } from "lucide-react";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import type { PublicRole, RegisterAcceptedResponse, RegisterRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { AUTH_INPUT_CHROME, passwordStrengthLabel } from "./auth-shared";
import { AUTH_ROLE_OPTIONS } from "./auth-role-options";
import { SignupSuccessPanel } from "./signup-success-panel";

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

  const activeRole = useMemo(() => AUTH_ROLE_OPTIONS.find((r) => r.value === role)!, [role]);
  const passwordStrength = useMemo(() => passwordStrengthLabel(password), [password]);

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
          {AUTH_ROLE_OPTIONS.map((option) => {
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
              className={AUTH_INPUT_CHROME}
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
              className={AUTH_INPUT_CHROME}
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
              className={AUTH_INPUT_CHROME}
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
                className={AUTH_INPUT_CHROME}
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
              className={AUTH_INPUT_CHROME}
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
              className={AUTH_INPUT_CHROME}
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
