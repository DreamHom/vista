import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "For renters & buyers" };

const benefits = [
  {
    icon: <Icon.Eye size={18} />,
    title: "What you see is what's there",
    copy: "No inflated photos, no &lsquo;come and see&rsquo; mystery rents. Every fee is itemised before you book a tour.",
  },
  {
    icon: <Icon.Sparkles size={18} />,
    title: "Dream AI does the boring part",
    copy: "Tell it the home, the budget, the vibe. It comes back with verified matches and what they&rsquo;re really worth.",
  },
  {
    icon: <Icon.Calendar size={18} />,
    title: "Inspections that don't clash",
    copy: "Pick a slot. The system blocks it. You can't accidentally show up at the same time as another applicant.",
  },
  {
    icon: <Icon.Coin size={18} />,
    title: "Moniepoint financing built-in",
    copy: "Stretch the down payment, finance the rent in advance. Apply right inside the listing.",
  },
  {
    icon: <Icon.ShieldCheck size={18} />,
    title: "Verified agents, verified owners",
    copy: "Look for the blue tick. We make people earn it; you don't have to chase it down.",
  },
  {
    icon: <Icon.Chat size={18} />,
    title: "Everything stays on platform",
    copy: "If something goes wrong, the receipts are right there. No more &lsquo;we said it on WhatsApp.&rsquo;",
  },
];

export default function ForApplicantsPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">
            For renters &amp; buyers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Find a home you actually like. Without the runaround.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            Browse without signing in. Save what you love. Ask the smart stuff to Dream AI.
            When you&rsquo;re ready to move, the platform makes the next step obvious — and
            financeable.
          </p>
          <div className="mt-7 flex gap-3">
            <ButtonLink href="/listings" trailingIcon={<Icon.ArrowRight size={16} />}>
              Start browsing
            </ButtonLink>
            <ButtonLink href="/dream" variant="outline">
              Or talk to Dream AI
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section className="py-16 lg:py-24">
        <SectionHeading
          eyebrow="What you actually get"
          title="Six things you won't get on a Lagos property WhatsApp group."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-bg-elevated p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                {b.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-fg">{b.title}</h3>
              <p
                className="mt-2 text-sm text-fg-muted leading-relaxed"
                dangerouslySetInnerHTML={{ __html: b.copy }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-24">
        <div className="rounded-3xl bg-fg text-fg-inverse p-10 lg:p-14">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Ready to stop scrolling and start moving?
          </h2>
          <p className="mt-3 text-bg/85 max-w-2xl">
            Sign up free. Save listings, request inspections, submit offers. Whenever
            you&rsquo;re ready, Moniepoint is on the other side of the loan button.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/register/applicant" variant="accent">
              Create my account
            </ButtonLink>
            <ButtonLink href="/listings" variant="ghost" className="text-fg-inverse hover:bg-white/10">
              Browse first
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
