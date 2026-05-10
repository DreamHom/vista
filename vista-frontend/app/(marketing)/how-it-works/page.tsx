import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From listing to keys-in-hand. The DreamHomes journey for owners, agents and applicants.",
};

const flows = [
  {
    role: "Owner",
    icon: <Icon.Home size={18} />,
    steps: [
      {
        title: "Create your listing",
        copy: "Photos, layout, fees, terms. Goes live immediately with an unverified badge — no waiting room.",
      },
      {
        title: "Verify (optional, but worth it)",
        copy: "Submit your ID and property documents. Verified listings get the strict blue tick and 3× the views.",
      },
      {
        title: "Pick your path",
        copy: "Self-manage, or assign a verified agent. Either way, you own the dashboard and the final say.",
      },
      {
        title: "Move from leads to keys",
        copy: "Inspections, offers, counter-offers — every move is logged. You decide when to sign.",
      },
    ],
  },
  {
    role: "Agent",
    icon: <Icon.Users size={18} />,
    steps: [
      {
        title: "Apply with credentials",
        copy: "License, CAC, identity. Admin reviews; the bar is high. We don't dilute the badge.",
      },
      {
        title: "Build a transparent profile",
        copy: "Areas covered, fees, deal history, response rate. The receipts speak before you do.",
      },
      {
        title: "Take on listings",
        copy: "Owners assign you, you accept. Multi-owner, multi-listing — everything in one calendar.",
      },
      {
        title: "Close, get reviewed, repeat",
        copy: "Every closed deal builds your score. Your next client can see exactly why you're worth the call.",
      },
    ],
  },
  {
    role: "Applicant",
    icon: <Icon.Heart size={18} />,
    steps: [
      {
        title: "Browse without signing up",
        copy: "Real listings, real prices, no inflated photos. Ask Dream AI when filters get boring.",
      },
      {
        title: "Save & ask",
        copy: "Save listings to compare, drop public questions, get answered by owners or agents — on the record.",
      },
      {
        title: "Inspect, then offer",
        copy: "Book a slot that doesn't clash with anyone else. Submit an offer with your terms; counter freely.",
      },
      {
        title: "Finance with Moniepoint",
        copy: "Buying or renting, our financing partner can stretch your down payment. No off-platform middlemen.",
      },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">
            <Icon.Sparkles size={12} />
            How DreamHomes works
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            From &ldquo;I want a home&rdquo; to &ldquo;here are the keys.&rdquo;
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            Three roles. One flow. Everything moves in the open, with a paper trail you can
            actually point at if anyone tries to play you.
          </p>
        </div>
      </Section>

      {flows.map((flow) => (
        <Section key={flow.role} className="py-16 lg:py-24">
          <SectionHeading
            eyebrow={`For ${flow.role.toLowerCase()}s`}
            title={`The ${flow.role.toLowerCase()} journey`}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {flow.steps.map((step, idx) => (
              <Card key={step.title}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      {flow.icon}
                    </span>
                    <span className="text-xs font-semibold tracking-widest text-fg-subtle">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-fg">{step.title}</h3>
                  <p className="mt-2 text-sm text-fg-muted leading-relaxed">{step.copy}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      ))}

      <Section className="pb-24">
        <div className="rounded-3xl border border-border bg-bg-elevated p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-fg">
            Pick your starting line.
          </h2>
          <p className="mt-3 text-fg-muted">Whichever side of the door you&rsquo;re on, we&rsquo;ve got you.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/register/owner">List a property</ButtonLink>
            <ButtonLink href="/register/agent" variant="outline">Join as agent</ButtonLink>
            <ButtonLink href="/listings" variant="ghost">Just browsing</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
