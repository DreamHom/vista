import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyEmailPage() {
  return (
    <div>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon.Bell size={20} />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-fg">Check your email.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        We sent a 6-digit code to your address. Enter it below to confirm — the code expires
        in 10 minutes.
      </p>

      <form className="mt-8 space-y-5">
        <Field label="6-digit code">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            className="tracking-[0.5em] text-center font-mono"
          />
        </Field>
        <Button size="lg" className="w-full">
          Verify email
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-fg-muted">
        Didn&rsquo;t get it?{" "}
        <button className="font-medium text-brand hover:text-brand-hover">
          Resend code
        </button>{" "}
        ·{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
