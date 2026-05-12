import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Apply · Agent" };

export default function AgentRegisterPage() {
  return (
    <div>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-4"
      >
        ← Back to roles
      </Link>
      <Badge tone="warn" className="mb-3">
        <Icon.Shield size={12} />
        Reviewed by admin · 24-72h
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight text-fg">
        Apply as an agent.
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        We verify identity, license and CAC. Once approved you go live with the
        badge — and leads start flowing. Submit the credentials below; after
        creating your account, finish KYC in your dashboard.
      </p>

      <RegisterForm
        role="AGENT"
        ctaLabel="Submit application"
        extraFields={
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Real estate license number">
                <Input
                  name="licenseNumber"
                  placeholder="NIESV / ESVARBON"
                />
              </Field>
              <Field label="CAC RC number">
                <Input name="cacNumber" placeholder="e.g. RC1234567" />
              </Field>
            </div>
            <Field
              label="Areas you cover"
              hint="Comma-separated. Be specific (e.g. &lsquo;Lekki Phase 1&rsquo;, not &lsquo;Lagos&rsquo;)."
            >
              <Input
                name="areasCovered"
                placeholder="Lekki Phase 1, Ikoyi, Victoria Island"
              />
            </Field>
            <Field label="A short bio for your profile">
              <Textarea
                name="bio"
                placeholder="What do you specialise in? What kind of clients do you do your best work for?"
              />
            </Field>
          </>
        }
      />
    </div>
  );
}
