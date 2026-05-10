import Link from "next/link";
import type { Metadata } from "next";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

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
      <h1 className="text-3xl font-semibold tracking-tight text-fg">Apply as an agent.</h1>
      <p className="mt-2 text-sm text-fg-muted">
        We verify identity, license and CAC. Once approved you go live with the badge — and
        leads start flowing.
      </p>

      <form className="mt-8 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input placeholder="As on your license" />
          </Field>
          <Field label="Phone">
            <Input placeholder="+234…" />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" />
        </Field>
        <Field label="Password">
          <Input type="password" />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Real estate license number">
            <Input placeholder="NIESV / ESVARBON" />
          </Field>
          <Field label="CAC RC number">
            <Input placeholder="e.g. RC1234567" />
          </Field>
        </div>
        <Field
          label="Areas you cover"
          hint="Comma-separated. Be specific (e.g. &lsquo;Lekki Phase 1&rsquo;, not &lsquo;Lagos&rsquo;)."
        >
          <Input placeholder="Lekki Phase 1, Ikoyi, Victoria Island" />
        </Field>
        <Field label="A short bio for your profile">
          <Textarea placeholder="What do you specialise in? What kind of clients do you do your best work for?" />
        </Field>
        <Button size="lg" className="w-full" trailingIcon={<Icon.ArrowRight size={16} />}>
          Submit application
        </Button>
      </form>
    </div>
  );
}
