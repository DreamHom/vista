import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "For agents" };

export default function ForAgentsPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">For agents</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Stop being lumped in with the chancers.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            DreamHomes lets serious agents stand out. License-checked, document-verified,
            review-anchored. Multi-owner, multi-listing — one calendar, one inbox, one score.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/register/agent" trailingIcon={<Icon.ArrowRight size={16} />}>
              Apply to join
            </ButtonLink>
            <ButtonLink href="/agents" variant="outline">
              See verified agents
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section className="py-16 lg:py-24">
        <SectionHeading
          eyebrow="Why join"
          title="Reputation, on the record."
          description="Your profile is a living portfolio: areas, specialisations, response time, deals closed, reviews — every metric earned."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: <Icon.ShieldCheck size={18} />,
              title: "The badge means something",
              copy: "We verify license + CAC + identity. The bar is high; the leads that land are too.",
            },
            {
              icon: <Icon.Users size={18} />,
              title: "Multiple owners, one workspace",
              copy: "Manage every listing across every owner from one calendar and one inbox.",
            },
            {
              icon: <Icon.Chart size={18} />,
              title: "Pipeline & analytics",
              copy: "Lead temperature, source, conversion. Plan your week using actual data.",
            },
            {
              icon: <Icon.Star size={18} />,
              title: "Reviews compound",
              copy: "Every closed deal lifts your score. New clients can see why you're the right call.",
            },
            {
              icon: <Icon.Coin size={18} />,
              title: "Transparent commissions",
              copy: "Your fee % shows on your profile. No haggling at the finish line.",
            },
            {
              icon: <Icon.Megaphone size={18} />,
              title: "Featured agent slots",
              copy: "Buy placement on relevant area pages and Dream AI replies. Strict quality bar.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-bg-elevated p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                {item.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-24">
        <div className="rounded-3xl border border-border bg-bg-elevated p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-fg">
            We&rsquo;re only as strong as our agent bench.
          </h2>
          <p className="mt-3 text-fg-muted max-w-2xl mx-auto">
            If you treat clients with respect and paperwork with patience, you&rsquo;ll find
            your home here.
          </p>
          <div className="mt-6">
            <ButtonLink href="/register/agent" size="lg">
              Start application
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
