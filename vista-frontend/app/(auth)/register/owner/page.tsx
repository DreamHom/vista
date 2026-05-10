import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Sign up · Owner" };

export default function OwnerRegisterPage() {
  return (
    <div>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-4"
      >
        ← Back to roles
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">List your property.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Listing is free. We&rsquo;ll set up your dashboard, then you can choose to verify
        ownership for the blue tick.
      </p>

      <form className="mt-8 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input placeholder="As on your ID" />
          </Field>
          <Field label="Phone">
            <Input placeholder="+234…" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" />
        </Field>
        <Field
          label="How many properties do you plan to list?"
          hint="Just a heads-up so we can scale your dashboard correctly."
        >
          <Input type="number" min={1} defaultValue={1} />
        </Field>
        <Button size="lg" className="w-full" trailingIcon={<Icon.ArrowRight size={16} />}>
          Create owner account
        </Button>
      </form>
    </div>
  );
}
