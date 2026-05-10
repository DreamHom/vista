import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">Welcome back.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Sign in to keep saved listings, inspections and offers in one place.
      </p>

      <form className="mt-8 space-y-5">
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" />
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
          <Input type="password" placeholder="••••••••" />
        </Field>
        <Button size="lg" className="w-full" trailingIcon={<Icon.ArrowRight size={16} />}>
          Sign in
        </Button>
      </form>

      <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-widest text-fg-subtle">
        <span className="flex-1 h-px bg-border" />
        or
        <span className="flex-1 h-px bg-border" />
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          className="h-11 rounded-full border border-border bg-bg-elevated text-sm font-medium hover:bg-bg-sunken"
        >
          Continue with Google
        </button>
        <button
          type="button"
          className="h-11 rounded-full border border-border bg-bg-elevated text-sm font-medium hover:bg-bg-sunken"
        >
          Continue with Moniepoint
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-fg-muted">
        New here?{" "}
        <Link href="/register" className="font-medium text-brand hover:text-brand-hover">
          Create an account
        </Link>
      </p>
    </div>
  );
}
