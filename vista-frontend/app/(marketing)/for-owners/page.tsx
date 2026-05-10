import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "For property owners" };

export default function ForOwnersPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">
            For owners
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Your property. Your rules. Way less drama.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            List in minutes. Choose to self-manage or assign a verified agent. Watch
            real applicants flow through your pipeline — saved, inspecting, offering — with
            every move on the record.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink
              href="/register/owner"
              trailingIcon={<Icon.ArrowRight size={16} />}
            >
              List my property
            </ButtonLink>
            <ButtonLink href="/owner/listings/new" variant="outline">
              Preview the dashboard
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section className="py-16 lg:py-24">
        <SectionHeading
          eyebrow="What you control"
          title="A workspace built around your property, not theirs."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: <Icon.Home size={18} />,
              title: "Self-manage or delegate",
              copy: "List solo when it's easy. Bring in a verified agent when it's not. You can switch any time.",
            },
            {
              icon: <Icon.Chart size={18} />,
              title: "Pipeline visibility",
              copy: "Saved · Inspection requested · Offer in. Lead temperature on every applicant. Know who&rsquo;s real.",
            },
            {
              icon: <Icon.ShieldCheck size={18} />,
              title: "Get the verified blue tick",
              copy: "Two tracks: owner identity + property documents. Once verified, listings convert ~3× harder.",
            },
            {
              icon: <Icon.Coin size={18} />,
              title: "Transparent fees, fewer fights",
              copy: "Caution, service charge, agency, legal — declared up front. Applicants come pre-aligned.",
            },
            {
              icon: <Icon.Calendar size={18} />,
              title: "Inspection conflict guard",
              copy: "Two applicants can never book the same slot. No awkward overlap at the gate.",
            },
            {
              icon: <Icon.Megaphone size={18} />,
              title: "Boost when you want to",
              copy: "Optional ad placements promote your listing in search and on the homepage.",
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
        <div className="grid gap-10 rounded-3xl bg-brand text-brand-fg p-10 lg:p-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Listing fees? They&rsquo;re free during beta.
            </h2>
            <p className="mt-3 text-brand-fg/85 max-w-xl">
              We make our money when you make a deal — agency commissions, optional
              promotions, financing partnerships. Listing your property costs nothing.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <ButtonLink
              href="/register/owner"
              variant="accent"
              size="lg"
              trailingIcon={<Icon.ArrowRight size={16} />}
            >
              Start listing free
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}