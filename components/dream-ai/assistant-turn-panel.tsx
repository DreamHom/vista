"use client";

import { MessageMarkdown } from "@/components/nexus-ui/message";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import type { AssistantTurnV1, TurnBlock } from "@/lib/dream-ai/contracts";
import type { PublicListing } from "@/lib/seed/public-data";

import { InlineListing } from "./inline-listing";

function listingById(listings: PublicListing[], id: number): PublicListing | undefined {
  return listings.find((l) => Number(l.id) === id);
}

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

  return (
    <div className="flex w-full flex-col gap-3">
      {streaming && !md.trim() ? (
        <TextShimmer duration={1.4} className="text-sm text-muted-foreground">
          Thinking…
        </TextShimmer>
      ) : md.trim() ? (
        <MessageMarkdown>{md}</MessageMarkdown>
      ) : null}
      {listingIdsForRail.length > 0 ? (
        <div className="flex w-full flex-col gap-2">
          {listingIdsForRail.map((id) => {
            const listing = listingById(listings, id);
            return listing ? (
              <InlineListing key={id} listing={listing} />
            ) : (
              <div
                key={id}
                className="border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground"
              >
                Listing #{id} isn&apos;t in the current browse snapshot.
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
