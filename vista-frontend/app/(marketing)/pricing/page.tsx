import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Pricing" };

const plans = [
  {
    name: "Applicant",
    price: "Free",
    sub: "Always free to browse, save, inspect, offer.",
    cta: { label: "Sign up free", href: "/register/applicant" },
    features: [
      "Unlimited saves & comparisons",
      "Inspection booking & no-show tracking",
      "Offer submission & negotiation",
      "Optional trust badge for faster replies",
      "Moniepoint financing in-line",
    ],
  },
  {
    name: "Owner",
    price: "Free",
    sub: "List unlimited properties. We earn from agency / promotion / financing.",
    cta: { label: "Start listing", href: "/register/owner" },
    highlighted: true,
    features: [
      "Unlimited listings",
      "Verification (identity + documents)",
      "Pipeline dashboard with lead temperature",
      "Optional agent assignment",
      "Inspection conflict prevention",
    ],
  },
  {
    name: "Agent",
    price: "Free + commission",
    sub: "We don&rsquo;t take a platform cut. Your fee is yours.",
    cta: { label: "Apply to join", href: "/register/agent" },
    features: [
      "Verified profile + reviews",
      "Multi-owner, multi-listing inbox",
      "Calendar + analytics",
      "Featured-agent ad slots (optional)",
      "Direct messaging with applicants",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Honest pricing. Just like everything else.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            DreamHomes is free for everyone during the bootcamp beta. We make money from
            agency commissions, optional promoted placements and financing partnerships —
            never from charging owners to list.
          </p>
        </div>
      </Section>

      <Section className="py-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                "rounded-3xl border p-8 " +
                (p.highlighted
                  ? "bg-brand text-brand-fg border-brand"
                  : "bg-bg-elevated border-border")
              }
            >
              <p
                className={
                  p.highlighted
                    ? "text-xs font-semibold uppercase tracking-[0.18em] text-brand-fg/70"
                    : "text-xs font-semibold uppercase tracking-[0.18em] text-brand"
                }
              >
                {p.name}
              </p>
              <p
                className="mt-3 text-4xl font-semibold tracking-tight"
                dangerouslySetInnerHTML={{ __html: p.price }}
              />
              <p
                className={
                  "mt-2 text-sm " +
                  (p.highlighted ? "text-brand-fg/85" : "text-fg-muted")
                }
                dangerouslySetInnerHTML={{ __html: p.sub }}
              />
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={
                      "flex items-start gap-2 text-sm " +
                      (p.highlighted ? "text-brand-fg/95" : "text-fg-muted")
                    }
                  >
                    <span
                      className={
                        "mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full " +
                        (p.highlighted
                          ? "bg-white/15 text-brand-fg"
                          : "bg-brand-soft text-brand")
                      }
                    >
                      <Icon.Check size={10} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <ButtonLink
                  href={p.cta.href}
                  variant={p.highlighted ? "accent" : "primary"}
                  className="w-full"
                >
                  {p.cta.label}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-24">
        <div className="rounded-3xl border border-border bg-bg-elevated p-8 lg:p-10">
          <h3 className="text-lg font-semibold text-fg">A word on agency fees</h3>
          <p className="mt-3 text-fg-muted leading-relaxed">
            Agents set their own commission, declared on their profile. Applicants see it
            before they engage. We don&rsquo;t charge a platform cut on top — we&rsquo;d
            rather earn from financing flow and promoted placements where the value is
            obvious.
          </p>
        </div>
      </Section>
    </>
  );
}
