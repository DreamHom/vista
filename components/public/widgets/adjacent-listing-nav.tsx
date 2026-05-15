import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import type { PublicListing } from "@/lib/seed/public-data";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import { ListingImage } from "@/components/public/public-components";
import { cn } from "@/lib/utils";

/**
 * Top-of-page prev / next pivot for `/listings/[id]`.
 *
 * Walks the public catalogue in the same newest-first order as the default
 * `/listings` index — so flipping with the arrows mirrors flipping through
 * the browse list a visitor probably came from. The middle slot links back
 * to the index so users can escape the linear flow when they want to.
 *
 * Renders server-side off of `getAdjacentListings(id)`; no hydration cost.
 */

export function AdjacentListingNav({
  previous,
  next,
}: {
  previous: PublicListing | null;
  next: PublicListing | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Adjacent listings"
      className="grid grid-cols-1 gap-0 border border-border bg-card sm:grid-cols-[1fr_auto_1fr] sm:items-stretch"
    >
      <AdjacentSlot listing={previous} direction="prev" />
      <Link
        href="/listings"
        className="inline-flex items-center justify-center gap-1.5 border-y border-border bg-secondary/40 px-4 py-3 text-xs font-semibold uppercase tracking-eyebrow text-foreground transition-colors hover:bg-secondary sm:border-x sm:border-y-0"
      >
        All listings
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
      <AdjacentSlot listing={next} direction="next" />
    </nav>
  );
}

function AdjacentSlot({
  listing,
  direction,
}: {
  listing: PublicListing | null;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";

  if (!listing) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground",
          isPrev ? "justify-start" : "justify-end sm:text-right",
        )}
      >
        {isPrev ? <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden /> : null}
        <span className="text-xs uppercase tracking-eyebrow">
          {isPrev ? "Start of list" : "End of list"}
        </span>
        {!isPrev ? <ArrowRight className="h-4 w-4 shrink-0" aria-hidden /> : null}
      </div>
    );
  }

  const photo = listing.photos[0];
  const fallback = fallbackListingPhoto(`${listing.id}-${listing.title}`, { w: 200, ratio: "1:1" });
  const price = formatNaira(listing.priceNgn, { compact: true });
  const period = listing.term === "RENT" ? "/yr" : "";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-secondary/40",
        isPrev ? "justify-start text-left" : "sm:flex-row-reverse sm:text-right",
      )}
    >
      {isPrev ? (
        <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5 group-hover:text-foreground" aria-hidden />
      ) : (
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
      )}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-muted">
        <ListingImage
          src={photo?.url}
          fallbackSrc={fallback.url}
          alt={photo?.alt ?? fallback.alt ?? listing.title}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-muted-foreground">
          {isPrev ? "Previous" : "Next"}
        </p>
        <p className="mt-0.5 line-clamp-1 text-sm font-semibold tracking-tight text-foreground">
          {listing.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">
            {price}
            {period}
          </span>
          {" · "}
          {listing.location}
        </p>
      </div>
    </Link>
  );
}
