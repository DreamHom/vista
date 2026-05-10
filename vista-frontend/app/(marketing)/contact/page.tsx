import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">Contact</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Talk to a human.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            Verified questions, partnership ideas, press, fraud reports — pick the one that
            fits and we&rsquo;ll be in touch within one business day.
          </p>
        </div>
      </Section>

      <Section className="pb-24 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form className="rounded-3xl border border-border bg-bg-elevated p-8 lg:p-10 space-y-5">
          <SectionHeading title="Drop us a line" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input placeholder="Your full name" />
            </Field>
            <Field label="Email">
              <Input type="email" placeholder="you@example.com" />
            </Field>
          </div>
          <Field label="What can we help with?">
            <Select defaultValue="general">
              <option value="general">General question</option>
              <option value="partnership">Partnership / press</option>
              <option value="fraud">Report fraud</option>
              <option value="agent">Agent application</option>
            </Select>
          </Field>
          <Field label="Tell us more">
            <Textarea placeholder="The shorter the better. We read every word." />
          </Field>
          <div className="pt-2">
            <Button type="submit" size="lg" trailingIcon={<Icon.ArrowRight size={16} />}>
              Send message
            </Button>
          </div>
        </form>

        <div className="space-y-5">
          {[
            {
              title: "Fraud reports",
              copy: "If you spot a fake listing or impersonator, this jumps the queue.",
              meta: "fraud@dreamhomes.ng · responds in <12h",
            },
            {
              title: "Press",
              copy: "Bootcamp coverage, interviews, product enquiries.",
              meta: "press@dreamhomes.ng",
            },
            {
              title: "Partnerships",
              copy: "Mortgage providers, insurance, utilities, building suppliers.",
              meta: "partner@dreamhomes.ng",
            },
            {
              title: "General support",
              copy: "Listings, accounts, billing, questions about Dream AI.",
              meta: "support@dreamhomes.ng",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-bg-elevated p-6"
            >
              <p className="text-sm font-semibold text-fg">{item.title}</p>
              <p className="mt-2 text-sm text-fg-muted">{item.copy}</p>
              <p className="mt-3 text-xs font-mono text-fg-subtle">{item.meta}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
