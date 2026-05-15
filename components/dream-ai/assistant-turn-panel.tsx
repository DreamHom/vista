"use client";

import { MessageMarkdown } from "@/components/nexus-ui/message";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssistantTurnV1, ChipOption, TurnBlock } from "@/lib/dream-ai/contracts";
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
  onChip,
}: {
  turn: AssistantTurnV1;
  listings: PublicListing[];
  /** Accumulated markdown during SSE `delta` before `final` overwrites. */
  streamingMarkdown: string;
  streaming: boolean;
  onChip?: (chip: ChipOption) => void;
}) {
  const meta = turn.meta ?? undefined;
  const md = streaming
    ? streamingMarkdown || turn.markdown || ""
    : turn.markdown || streamingMarkdown || "";

  const chipsBlock = turn.blocks?.find((b): b is TurnBlock & { type: "chips" } => b.type === "chips");
  const listingsBlocks = turn.blocks?.filter((b): b is TurnBlock & { type: "listings" } => b.type === "listings") ?? [];
  const compareBlock = turn.blocks?.find((b): b is TurnBlock & { type: "compare" } => b.type === "compare");

  const listingIdsForRail: number[] = [];
  for (const b of listingsBlocks) {
    for (const id of b.listingIds ?? []) {
      if (id != null && !listingIdsForRail.includes(Number(id))) listingIdsForRail.push(Number(id));
    }
  }

  const compareIds = (compareBlock?.compareListingIds ?? []).filter((x): x is number => x != null).map(Number);

  return (
    <div className="flex w-full flex-col gap-3">
      {meta?.staleIdsFiltered ? (
        <p className="text-[11px] text-muted-foreground">
          Some saved picks are no longer on the market and were hidden from this thread.
        </p>
      ) : null}
      {(meta?.inventoryEmpty || meta?.queryTooStrict) && !streaming ? (
        <p className="text-xs text-muted-foreground">
          {meta.inventoryEmpty
            ? "Nothing in the live catalogue matched that yet."
            : "Your filters may be tight; try widening budget or area."}
        </p>
      ) : null}
      {meta?.degraded && !streaming ? (
        <p className="text-[11px] text-muted-foreground">Ranking used a fallback path (live matcher degraded).</p>
      ) : null}

      {streaming && !md.trim() ? (
        <TextShimmer duration={1.4} className="text-sm text-muted-foreground">
          Thinking…
        </TextShimmer>
      ) : md.trim() ? (
        <MessageMarkdown>{md}</MessageMarkdown>
      ) : null}

      {chipsBlock?.options?.length && onChip ? (
        <div className="flex flex-wrap gap-2">
          {chipsBlock.options.map((chip) => (
            <Button
              key={chip.id}
              type="button"
              variant="outline"
              size="sm"
              className={cn("rounded-none text-left font-normal")}
              disabled={streaming}
              onClick={() => onChip(chip)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
      ) : null}

      {compareIds.length >= 2 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {compareIds.slice(0, 2).map((id) => {
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

      {listingIdsForRail.length > 0 && turn.kind !== "compare" ? (
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
