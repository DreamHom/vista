import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/landing/section-heading";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the DreamHomes mission, values, and team.",
};

const VALUES = [
  {
    title: "Transparency",
    body: "Fees, trust signals, and serious actions should be visible instead of hidden behind pressure or side chats.",
  },
  {
    title: "Trust",
    body: "Verification should mean something. Every important signal should help users decide whether a listing or person feels credible.",
  },
  {
    title: "Everything on-platform",
    body: "The best housing journeys leave a trail. Discovery can be open, but inspections, offers, and sensitive interactions should stay documented.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">About Us</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          DreamHomes exists to make dreams come true in a market that often feels confusing to trust.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          We are building a calmer, trust-first property platform for Nigeria, designed to reduce fraud, opacity, and friction across renting, buying, listing, and agent discovery.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">The problem we solve</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Nigerian real estate is full of duplicated listings, hidden charges, shaky trust signals, and too many important decisions being made off-platform.
            </p>
            <p>
              DreamHomes is designed to turn that into a clearer experience where people can browse openly, verify what matters, and move into serious workflows with confidence.
            </p>
          </div>
        </div>

        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">The team</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>DreamHomes was built through the Moniepoint DreamDev Bootcamp 2026 as a product vision for better real estate discovery and transaction flow.</p>
            <p>
              The team direction combines product thinking, frontend design, and backend workflow discipline around one idea: everything important should be easier to trust.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Platform Values"
          title="The principles behind DreamHomes"
          supporting="These values shape how listings are surfaced, how people are verified, and why serious actions belong on-platform."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="border border-border bg-card p-6">
              <h2 className="text-xl font-semibold tracking-tight">{value.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/listings" className={buttonVariants({ variant: "primary", size: "lg" })}>
          Browse Listings
        </Link>
        <Link href="/signup" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Join DreamHomes
        </Link>
      </div>
    </div>
  );
}
