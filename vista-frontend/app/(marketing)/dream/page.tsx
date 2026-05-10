import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/listings/listing-card";
import { listings } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dream AI",
  description: "Conversational property search. Describe the home, get verified matches.",
};

const matches = listings.slice(0, 3);

export default function DreamPage() {
  return (
    <>
      <Section className="bg-dream-gradient">
        <div className="py-16 lg:py-20 max-w-3xl">
          <Badge tone="brand" className="mb-4">
            <Icon.Sparkles size={12} />
            Dream AI · discovery & guidance
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-fg leading-tight">
            Describe the home. We&rsquo;ll do the legwork.
          </h1>
          <p className="mt-5 text-lg text-fg-muted leading-relaxed">
            Dream AI reads our entire listing graph — verified or not, comments included —
            and brings back matches with context. Area averages, fee comparisons, mortgage
            options, the works.
          </p>
        </div>
      </Section>

      <Section className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* chat column */}
          <div className="rounded-3xl border border-border bg-bg-elevated p-6 h-fit lg:sticky lg:top-20">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-fg">
                <Icon.Sparkles size={14} />
              </span>
              <p className="text-sm font-medium text-fg">Dream AI</p>
              <Badge tone="success" className="ml-auto">
                online
              </Badge>
            </div>

            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto">
              <Bubble side="ai">
                Hey 👋 Tell me what you&rsquo;re looking for. Ballpark budget, vibe, area —
                I&rsquo;ll go from there.
              </Bubble>
              <Bubble side="user">
                3-bed in Lekki Phase 1, quiet street, under ₦8M/year, near a school.
              </Bubble>
              <Bubble side="ai">
                4 verified matches. Top pick: a 3-bed two minutes from Admiralty, ₦6.5M/yr,
                all-in fees ₦2.15M. That&rsquo;s about 7% below the area average for similar
                units this quarter. Want me to surface the photos?
              </Bubble>
              <Bubble side="user">Yes — and which ones are closest to a school?</Bubble>
              <Bubble side="ai">
                Two of the four sit within 600m of a primary school (showing on right). I
                can also flag which buildings have 24/7 power if that matters.
              </Bubble>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-bg-sunken/50 p-2 flex items-center gap-2">
              <input
                placeholder="Ask anything…"
                className="flex-1 bg-transparent px-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
              />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-fg hover:bg-brand-hover"
                aria-label="Send"
              >
                <Icon.ArrowRight size={16} />
              </button>
            </div>

            <p className="mt-3 text-[11px] text-fg-subtle">
              Capstone scope: discovery and guidance only. Dream AI doesn&rsquo;t book or
              transact for you — it surfaces and explains.
            </p>
          </div>

          {/* results */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Live matches · updated as you chat
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
              {matches.length} listings worth your evening
            </h2>
            <p className="mt-2 text-sm text-fg-muted">
              Ranked by fit, then verified-first. Tap any card to dig in.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {matches.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-bg-elevated p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                First-time renting?
              </p>
              <h3 className="mt-2 text-lg font-semibold text-fg">
                Dream AI explains the fees before you sign anything.
              </h3>
              <p className="mt-2 text-sm text-fg-muted">
                Caution, agency, service charge, legal — what they are, when they&rsquo;re
                normal, and when to push back.
              </p>
              <div className="mt-4">
                <ButtonLink href="/how-it-works" variant="outline" size="sm">
                  How it works
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Bubble({
  side,
  children,
}: {
  side: "user" | "ai";
  children: React.ReactNode;
}) {
  if (side === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[88%] rounded-2xl rounded-br-sm bg-brand px-3.5 py-2.5 text-sm text-brand-fg leading-relaxed">
          {children}
        </p>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <p className="max-w-[92%] rounded-2xl rounded-bl-sm bg-bg-sunken border border-border px-3.5 py-2.5 text-sm text-fg leading-relaxed">
        {children}
      </p>
    </div>
  );
}
