import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input, Select } from "@/components/ui/input";
import { RegisterForm } from "@/components/auth/register-form";

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
      <h1 className="text-3xl font-semibold tracking-tight text-fg">
        Find your next home.
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        Free forever. Saves your inspections, offers and conversations in one
        place.
      </p>

      <RegisterForm
        role="APPLICANT"
        extraFields={
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="What are you after?">
              <Select name="lookingFor" defaultValue="rent">
                <option value="rent">Renting</option>
                <option value="sale">Buying</option>
              </Select>
            </Field>
            <Field label="Where (optional)">
              <Input
                name="preferredCity"
                placeholder="Lagos, Abuja, Port Harcourt…"
              />
            </Field>
          </div>
        }
      />
    </div>
  );
}
