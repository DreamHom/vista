/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { fallbackListingPhoto } from "@/lib/seed/photos";
import type { PublicListing } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";
import { VerificationBadgeWithPopover } from "../verification-badge-popover";

import { ListingImage } from "./listing-image";

export function CompactListingTile({
  listing,
  ctaLabel = "View listing",
  ctaHref,
}: {
  listing: PublicListing;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const photo = listing.photos[0];
  const fallback = fallbackListingPhoto(`${listing.id}-${listing.title}`, { w: 560, ratio: "4:3" });

  const href = ctaHref ?? `/listings/${listing.id}`;

  return (
    <div className="grid min-w-0 gap-4 border border-border bg-card p-4 sm:grid-cols-[8.75rem_minmax(0,1fr)]">
      <div className="group/tile relative aspect-[4/3] min-h-0 w-full overflow-hidden bg-muted sm:aspect-[4/3] sm:h-auto sm:self-start">
        <Link href={href} className="absolute inset-0 z-0 block">
          <ListingImage
            src={photo?.url}
            fallbackSrc={fallback.url}
            alt={photo?.alt ?? fallback.alt ?? listing.title}
            className="h-full w-full transition-transform duration-500 group-hover/tile:scale-[1.03]"
          />
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 z-10 opacity-0 transition-all duration-300 group-hover/tile:pointer-events-auto group-hover/tile:opacity-100">
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-9 w-9 rounded-none border-white/80 bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:border-foreground hover:bg-secondary",
            )}
            aria-label={ctaLabel}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {listing.verified ? (
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadgeWithPopover label="Verified" align="start" />
          </div>
        ) : null}
        <div className="min-w-0">
          <Link
            href={href}
            className="block text-pretty text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors hover:text-accent"
          >
            {listing.title}
          </Link>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-snug text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 break-words">{listing.location}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {formatNaira(listing.priceNgn, { compact: true })}
            {listing.term === "RENT" ? " /year" : ""}
          </span>
          {listing.bedrooms !== null ? (
            <span className="whitespace-nowrap">· {listing.bedrooms} bed</span>
          ) : null}
          {listing.bathrooms !== null ? (
            <span className="whitespace-nowrap">· {listing.bathrooms} bath</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
