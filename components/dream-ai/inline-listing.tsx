"use client";

/**
 * Compact, in-chat listing recommendation. Shown inside an assistant
 * message after the AI proposes matches: clickable through to the full
 * `/listings/[id]` page. Visually slimmer than the marketing ListingCard
 * because it lives inside a chat bubble, not a grid.
 */

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicListing } from "@/lib/seed/public-data";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import { ListingImage } from "@/components/public/public-components";

export function InlineListing({ listing }: { listing: PublicListing }) {
  const photo = listing.photos[0];
  const fallback = fallbackListingPhoto(`${listing.id}-${listing.title}`, { w: 400, ratio: "4:3" });
  const price = formatNaira(listing.priceNgn, { compact: true });
  const period = listing.term === "RENT" ? "/yr" : "";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block border border-border bg-background transition-colors hover:bg-secondary"
    >
      <div className="flex gap-3 p-2">
        <div className="h-20 w-28 shrink-0 overflow-hidden bg-muted">
          <ListingImage src={photo?.url} fallbackSrc={fallback.url} alt={photo?.alt ?? fallback.alt ?? listing.title} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1 pr-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-1 text-sm font-semibold tracking-tight text-foreground">
              {listing.title}
            </h4>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {listing.location}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold tabular-nums text-foreground">
              {price}
              <span className="text-muted-foreground">{period}</span>
            </span>
            {listing.bedrooms !== null ? (
              <span className="text-muted-foreground">
                {listing.bedrooms} bed · {listing.bathrooms} bath
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
