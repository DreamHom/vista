"use client";

import Link from "next/link";
import { Bath, BedDouble, MapPin } from "lucide-react";

import { useCompareSelectionOptional } from "@/components/dream-ai/compare-selection-store";
import { ListingCardMedia } from "@/components/listings/listing-card-media";
import { ListingTrustChips } from "@/components/public/listing-trust-chips";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import { type PublicListing, formatAvailability } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";

function formatPropertyTypeLabel(type: PublicListing["type"]): string {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function ListingDiscoveryCard({
  listing,
  compareMode = false,
}: {
  listing: PublicListing;
  compareMode?: boolean;
}) {
  const period = listing.term === "RENT" ? "/year" : "";
  const photo = listing.photos[0];
  const fallback = fallbackListingPhoto(`${listing.id}-${listing.title}`, { w: 800, ratio: "4:3" });
  const compare = useCompareSelectionOptional();
  const numericId = Number(listing.id);
  const selected = compare?.isSelected(numericId) ?? false;

  return (
    <article className="group/card border border-border bg-card">
      <div className="relative">
        <ListingCardMedia
          listingId={listing.id}
          photoUrl={photo?.url}
          fallbackUrl={fallback.url}
          alt={photo?.alt ?? fallback.alt ?? listing.title}
        />
        <div className="pointer-events-auto absolute left-4 top-4 z-40 flex flex-col items-start gap-2 drop-shadow-md">
          <ListingTrustChips
            ownerIdentityVerifiedAt={listing.ownerIdentityVerifiedAt}
            documentsVerifiedAt={listing.documentsVerifiedAt}
          />
        </div>
        {compareMode && compare ? (
          <label
            className={cn(
              "absolute right-4 top-4 z-40 flex items-center gap-2 border border-border bg-card px-2 py-1.5 text-xs font-medium shadow-sm transition-opacity",
              selected
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100",
            )}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={selected}
              aria-label="Add this listing to compare"
              onChange={() => {
                if (!selected && compare.atCap) {
                  toast.message("Up to 5 listings can be compared at once. Uncheck one to swap.");
                  return;
                }
                compare.toggle(numericId);
              }}
            />
            Compare
          </label>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/listings/${listing.id}`}
                className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
              >
                {listing.title}
              </Link>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {listing.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">
                {formatNaira(listing.priceNgn, { compact: true })}
                {period}
              </p>
              <p className="text-xs text-muted-foreground">{formatAvailability(listing.availability)}</p>
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {listing.headline ?? listing.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="border border-border px-3 py-1 text-foreground">{formatPropertyTypeLabel(listing.type)}</span>
          {listing.bedrooms !== null ? (
            <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1">
              <BedDouble className="h-4 w-4" aria-hidden />
              {listing.bedrooms} bed
            </span>
          ) : null}
          {listing.bathrooms !== null ? (
            <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1">
              <Bath className="h-4 w-4" aria-hidden />
              {listing.bathrooms} bath
            </span>
          ) : null}
          {listing.sizeSqm !== null ? <span className="border border-border px-3 py-1">{listing.sizeSqm} sqm</span> : null}
        </div>

        <div className="pt-1">
          <Link
            href={`/listings/${listing.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full rounded-none sm:w-auto")}
          >
            View listing
          </Link>
        </div>
      </div>
    </article>
  );
}
