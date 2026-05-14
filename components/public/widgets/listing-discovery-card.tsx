/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight, Bath, BedDouble, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import { type PublicListing, formatAvailability } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";
import { VerificationBadgeWithPopover } from "../verification-badge-popover";

import { ListingImage } from "./listing-image";

function formatPropertyTypeLabel(type: PublicListing["type"]): string {
  return type
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function ListingDiscoveryCard({ listing }: { listing: PublicListing }) {
  const period = listing.term === "RENT" ? "/year" : "";
  const photo = listing.photos[0];
  const fallback = fallbackListingPhoto(`${listing.id}-${listing.title}`, { w: 800, ratio: "4:3" });

  return (
    <article className="group/card border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link href={`/listings/${listing.id}`} className="absolute inset-0 z-0 block">
          <ListingImage
            src={photo?.url}
            fallbackSrc={fallback.url}
            alt={photo?.alt ?? fallback.alt ?? listing.title}
            className="h-full w-full transition-transform duration-700 group-hover/card:scale-[1.03]"
          />
        </Link>
        {listing.verified ? (
          <div className="absolute left-4 top-4 z-20 drop-shadow-md">
            <VerificationBadgeWithPopover label="Verified" align="start" />
          </div>
        ) : null}
        <div className="pointer-events-none absolute right-4 top-4 z-20 opacity-0 transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:opacity-100">
          <Link
            href={`/listings/${listing.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 rounded-none border-white/80 bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:border-foreground hover:bg-secondary",
            )}
            aria-label={`Open ${listing.title}`}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
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
      </div>
    </article>
  );
}
