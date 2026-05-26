"use client";

import { MessageMarkdown } from "@/components/nexus-ui/message";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import type { AssistantTurnV1, TurnBlock } from "@/lib/dream-ai/contracts";
import { useCompareListings } from "@/lib/dream-ai/use-compare-listings";
import type { PublicListing } from "@/lib/seed/public-data";

import { InlineListing } from "./inline-listing";

export function AssistantTurnPanel({
  turn,
  listings,
  streamingMarkdown,
  streaming,
}: {
  turn: AssistantTurnV1;
  listings: PublicListing[];
  /** Accumulated markdown during SSE `delta` before `final` overwrites. */
  streamingMarkdown: string;
  streaming: boolean;
}) {
  const md = streaming
    ? streamingMarkdown || turn.markdown || ""
    : turn.markdown || streamingMarkdown || "";

  const listingsBlocks =
    turn.blocks?.filter((b): b is TurnBlock & { type: "listings" } => b.type === "listings") ?? [];

  const listingIdsForRail: number[] = [];
  for (const b of listingsBlocks) {
    for (const id of b.listingIds ?? []) {
      if (id != null && !listingIdsForRail.includes(Number(id))) listingIdsForRail.push(Number(id));
    }
  }

  // Resolve IDs against the props catalog first; for IDs not in the catalog
  // (e.g. haven returned newer listings than the inventory snapshot we
  // server-rendered with), fetch them on demand from /listings/{id}. Stops
  // the "Listing #X isn't in the current browse snapshot" placeholders that
  // made the response look broken when haven and the snapshot disagreed.
  const { resolved, loading } = useCompareListings(listings, listingIdsForRail);

  // Haven's `embeddings-only` provider mode (LLM unavailable) returns no
  // markdown at all, just `listingIds`. Without a fallback heading the
  // response reads as "the AI said nothing." Give it a one-line frame so
  // the rail has context.
  const finalMd = md.trim();
  const showFallbackHeading =
    !streaming && !finalMd && listingIdsForRail.length > 0 && turn.kind === "reply";

  return (
    <div className="flex w-full flex-col gap-3">
      {streaming && !finalMd ? (
        <TextShimmer duration={1.4} className="text-sm text-muted-foreground">
          Thinking…
        </TextShimmer>
      ) : finalMd ? (
        <MessageMarkdown>{finalMd}</MessageMarkdown>
      ) : showFallbackHeading ? (
        <p className="text-sm text-foreground">
          Closest matches I could find in the live catalogue:
        </p>
      ) : null}

      {listingIdsForRail.length > 0 ? (
        <div className="flex w-full flex-col gap-2">
          {listingIdsForRail.map((id, index) => {
            const listing = resolved[index] ?? null;
            if (listing) {
              return <InlineListing key={id} listing={listing} />;
            }
            if (loading) {
              return (
                <div
                  key={id}
                  className="h-20 w-full animate-pulse border border-border bg-muted/40"
                  aria-label={`Loading listing ${id}`}
                />
              );
            }
            return (
              <div
                key={id}
                className="border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground"
              >
                Listing #{id} is no longer available on the platform.
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
