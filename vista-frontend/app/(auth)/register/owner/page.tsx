import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input } from "@/components/ui/input";
import { RegisterForm } from "@/components/auth/register-form";

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
      <h1 className="text-3xl font-semibold tracking-tight text-fg">
        List your property.
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        Listing is free. We&rsquo;ll set up your dashboard, then you can choose
        to verify ownership for the blue tick.
      </p>

      <RegisterForm
        role="OWNER"
        ctaLabel="Create owner account"
        extraFields={
          <Field
            label="How many properties do you plan to list?"
            hint="Just a heads-up so we can scale your dashboard correctly."
          >
            <Input
              name="plannedListings"
              type="number"
              min={1}
              defaultValue={1}
            />
          </Field>
        }
      />
    </div>
  );
}
