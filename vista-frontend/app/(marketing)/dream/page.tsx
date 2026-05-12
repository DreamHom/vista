import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/listings/listing-card";
import * as Listings from "@/lib/api/listings";
import { listingFromApi } from "@/lib/api/adapters";

export const metadata: Metadata = {
  title: "Dream AI",
  description: "Conversational property search. Describe the home, get verified matches.",
};

export default async function DreamPage() {
  const data = await Listings.listListings({ page: 0, size: 3 }).catch(() => null);
  const matches = data?.content?.length ? data.content.map((x) => listingFromApi(x)) : [];

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
            Dream AI reads our listing graph and brings back live matches from haven. Full
            conversational search still lands here when you connect an LLM to listing data.
          </p>
        </div>
      </Section>

      <Section className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
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
                Here are live matches from haven below — open any card for full detail, fees
                and comments.
              </Bubble>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-fg mb-4">Live matches from marketplace</p>
            {matches.length === 0 ? (
              <p className="text-sm text-fg-muted">
                No listings returned — check the backend or try the browse page.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-1">
                {matches.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
            <div className="mt-8">
              <ButtonLink href="/listings" trailingIcon={<Icon.ArrowRight size={16} />}>
                Browse all listings
              </ButtonLink>
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
  children: ReactNode;
}) {
  if (side === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-4 py-3 text-sm text-brand-fg leading-relaxed">
          {children}
        </p>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <p className="max-w-[90%] rounded-2xl rounded-bl-sm bg-bg-sunken border border-border px-4 py-3 text-sm text-fg leading-relaxed">
        {children}
      </p>
    </div>
  );
}
