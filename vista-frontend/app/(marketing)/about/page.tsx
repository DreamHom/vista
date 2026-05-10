import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-24 max-w-3xl">
          <Badge tone="brand" className="mb-4">About DreamHomes</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Housing is fundamental. The way we transact on it shouldn&rsquo;t feel like a stunt.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            DreamHomes is being built at the Moniepoint DreamDev Bootcamp 2026 by Team
            DreamHomes — a small group of engineers, designers and operators who think the
            way property changes hands deserves a serious upgrade.
          </p>
        </div>
      </Section>

      <Section className="py-16 lg:py-24 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Why we built it"
            title="Five problems we refuse to ship around."
          />
          <ul className="mt-8 space-y-5">
            {[
              { t: "Fraud", c: "Fake listings, fake agents, unverified ownership." },
              { t: "Opacity", c: "Hidden agent fees, undisclosed charges, no deal visibility." },
              { t: "Friction", c: "Everything happens off-platform, leaving zero paper trail." },
              { t: "Inaccessibility", c: "Financing is disconnected from discovery." },
              { t: "Poor discovery", c: "Search is rigid; it doesn't understand what people actually want." },
            ].map((item) => (
              <li key={item.t} className="flex gap-4">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <Icon.X size={14} />
                </span>
                <div>
                  <p className="font-semibold text-fg">{item.t}</p>
                  <p className="text-sm text-fg-muted">{item.c}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-bg-elevated p-8 lg:p-10">
          <SectionHeading
            eyebrow="What we&rsquo;re building"
            title="A dream delivery machine."
          />
          <p className="mt-4 text-fg-muted leading-relaxed">
            DreamHomes connects owners, agents and applicants in a transparent, trust-first
            environment — with Moniepoint-powered home financing baked into discovery so a
            dream isn&rsquo;t blocked by a missing 20% down payment.
          </p>
          <p className="mt-4 text-fg-muted leading-relaxed">
            We&rsquo;re not just a listings site. We&rsquo;re the operating system for a
            transaction that touches identity, finance, legal and trust — and we want every
            piece of that on the record.
          </p>
        </div>
      </Section>

      <Section className="pb-24">
        <div className="rounded-3xl bg-fg text-fg-inverse p-10 lg:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bg/70">
            Capstone scope · 2026
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            haven (backend) · vista (frontend) — built together, shipped together.
          </h2>
          <p className="mt-4 text-bg/85 max-w-2xl">
            Vista is the window into DreamHomes. Haven is the engine room behind it. Both
            repos live in the same heartbeat: making dreams come true, one home at a time.
          </p>
        </div>
      </Section>
    </>
  );
}
