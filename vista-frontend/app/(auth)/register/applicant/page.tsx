import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Sign up · Applicant" };

export default function ApplicantRegisterPage() {
  return (
    <div>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-4"
      >
        ← Back to roles
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">Find your next home.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Free forever. Saves your inspections, offers and conversations in one place.
      </p>

      <form className="mt-8 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name">
            <Input placeholder="Daniel" />
          </Field>
          <Field label="Last name">
            <Input placeholder="Olatunji" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="At least 10 characters; mix it up.">
          <Input type="password" placeholder="••••••••" />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="What are you after?">
            <Select defaultValue="rent">
              <option value="rent">Renting</option>
              <option value="sale">Buying</option>
            </Select>
          </Field>
          <Field label="Where">
            <Input placeholder="Lagos, Abuja, Port Harcourt…" />
          </Field>
        </div>
        <Button size="lg" className="w-full" trailingIcon={<Icon.ArrowRight size={16} />}>
          Create account
        </Button>
      </form>
    </div>
  );
}
