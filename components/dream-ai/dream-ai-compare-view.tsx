"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";

import { MessageMarkdown } from "@/components/nexus-ui/message";
import { cn } from "@/lib/utils";
import type { CompareReasoning, PerListingNote } from "@/lib/dream-ai/contracts";
import { useCompareListings } from "@/lib/dream-ai/use-compare-listings";
import type { PublicListing } from "@/lib/seed/public-data";

import { InlineListing } from "./inline-listing";

function noteForId(reasoning: CompareReasoning | null | undefined, id: number): PerListingNote | undefined {
  return reasoning?.perListing?.find((row) => row.id === id);
}

function CompareListingCard({
  listing,
  note,
  recommended,
}: {
  listing: PublicListing | null;
  note?: PerListingNote;
  recommended: boolean;
}) {
  const title = note?.headline ?? (listing ? listing.title : `Listing #${note?.id ?? "?"}`);

  return (
    <article
      className={cn(
        "flex flex-col border bg-background",
        recommended ? "border-accent ring-1 ring-accent/30" : "border-border",
      )}
    >
      {recommended ? (
        <div className="flex items-center gap-1.5 border-b border-accent/25 bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
          <Check className="h-3.5 w-3.5" aria-hidden />
          Recommended for your brief
        </div>
      ) : null}

      {listing ? (
        <InlineListing listing={listing} />
      ) : (
        <div className="border-b border-border px-4 py-5">
          <p className="font-semibold tracking-tight text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t load this listing in the current browse snapshot.{" "}
            <Link href={`/listings/${note?.id}`} className="font-medium text-primary hover:text-primary/80">
              View listing #{note?.id}
            </Link>
          </p>
        </div>
      )}

      {note ? (
        <div className="space-y-3 border-t border-border px-4 py-4 text-sm">
          {!listing ? (
            <p className="font-medium leading-snug text-foreground">{note.headline}</p>
          ) : null}
          {note.bestFor ? (
            <p className="text-pretty leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Best for: </span>
              {note.bestFor}
            </p>
          ) : null}
          {note.pros.length > 0 ? (
            <ul className="space-y-1.5">
              {note.pros.map((item) => (
                <li key={item} className="flex gap-2 text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {note.cons.length > 0 ? (
            <ul className="space-y-1.5">
              {note.cons.map((item) => (
                <li key={item} className="flex gap-2 text-muted-foreground">
                  <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function DreamAiCompareView({
  compareListingIds,
  compareReasoning,
  markdown,
  catalog,
  streaming,
}: {
  compareListingIds: number[];
  compareReasoning?: CompareReasoning | null;
  markdown: string;
  catalog: PublicListing[];
  streaming: boolean;
}) {
  const { resolved, loading } = useCompareListings(catalog, compareListingIds);
  const hasReasoning = Boolean(compareReasoning?.perListing?.length || compareReasoning?.summary);
  const summary = markdown.trim() || compareReasoning?.summary?.trim() || "";
  const recommendedId = compareReasoning?.recommendedListingId ?? null;

  if (compareListingIds.length < 2) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {summary && !streaming ? (
        <MessageMarkdown>{summary}</MessageMarkdown>
      ) : null}

      {!hasReasoning && !streaming && !loading ? (
        <p className="text-xs text-muted-foreground">
          Side-by-side layout only — live AI commentary wasn&apos;t available for this turn.
        </p>
      ) : null}

      <div
        className={cn(
          "grid gap-4",
          compareListingIds.length >= 3 ? "md:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {compareListingIds.map((id, index) => (
          <CompareListingCard
            key={id}
            listing={resolved[index] ?? null}
            note={noteForId(compareReasoning, id)}
            recommended={recommendedId === id}
          />
        ))}
      </div>
    </div>
  );
}
