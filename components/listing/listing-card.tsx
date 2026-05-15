"use client";

import Image from "next/image";
import Link from "next/link";
import { type SeedListing } from "@/lib/seed/listings";
import { photoUrl } from "@/lib/seed/photos";
import { formatNaira } from "@/lib/format";
import { useTranslations } from "@/lib/i18n/provider";
import { iconForListingType, iconForPropertyType } from "@/components/public/listing-pill-defs";
import { cn } from "@/lib/utils";

const RATIO_CLASS = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
} as const;

const RATIO_PARAM = {
  "1:1": "1:1",
  "4:3": "4:3",
  "3:2": "3:2",
} as const satisfies Record<keyof typeof RATIO_CLASS, "1:1" | "4:3" | "3:2">;

export interface ListingCardProps {
  listing: SeedListing;
  /**
   * `overlay`: chromeless card with a top meta bar (icons + type/term + price)
   * on the photo and a description paragraph below. Used in the landing grid.
   *
   * `thumb`: bare aspect-cropped photo only. Used in mini-galleries and
   * hero strips.
   */
  variant?: "overlay" | "thumb";
  ratio?: keyof typeof RATIO_CLASS;
  /** Flag the LCP candidate (set on the hero photo). */
  priority?: boolean;
  /** Pixel width hint for the CDN; match against the layout's actual size. */
  width?: number;
  className?: string;
}

/**
 * Chromeless card: the photo is the canvas. Overlay variant uses a compact
 * top bar (backdrop + border) for type + term icons/labels and price; title
 * sits bottom-left on a gradient. Thumb variant is photo-only.
 */
export function ListingCard({
  listing,
  variant = "overlay",
  ratio = "4:3",
  priority = false,
  width = 800,
  className,
}: ListingCardProps) {
  const { t } = useTranslations();
  const photo = listing.photos[0];
  const href = `/listings/${listing.id}`;

  if (variant === "thumb") {
    return (
      <Link
        href={href}
        className={cn(
          "relative block overflow-hidden rounded-none",
          RATIO_CLASS[ratio],
          className,
        )}
      >
        <Image
          src={photoUrl(photo, { w: width, ratio: RATIO_PARAM[ratio] })}
          alt={photo.alt}
          fill
          unoptimized
          priority={priority}
          sizes="200px"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>
    );
  }

  const priceText = formatNaira(listing.priceNgn, { compact: true });
  const periodText = listing.term === "RENT" ? t.perYear : "";
  const PropertyIcon = iconForPropertyType(listing.type);
  const TermIcon = iconForListingType(listing.term);
  const termLabel =
    listing.term === "RENT" ? t.listingsPreview.filters.rent : t.listingsPreview.filters.sale;

  return (
    <article className={cn("group flex flex-col gap-3", className)}>
      <Link
        href={href}
        className={cn(
          "relative block overflow-hidden rounded-none bg-muted",
          RATIO_CLASS[ratio],
        )}
      >
        <Image
          src={photoUrl(photo, { w: width, ratio: RATIO_PARAM[ratio] })}
          alt={photo.alt}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {/* Editorial mood: slight all-over darkening + stronger bottom gradient
            for legible overlay text. Reference cards read moodier, like magazine
            print rather than bright snaps. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10"
          aria-hidden
        />

        {/* Top meta bar: property + listing term as icons + labels, price right */}
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/20 bg-black/50 px-3 py-2 shadow-sm backdrop-blur-md">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 sm:gap-x-3">
            <span className="inline-flex max-w-[55%] items-center gap-1.5 text-white sm:max-w-none">
              <PropertyIcon className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
              <span className="truncate text-xs font-medium leading-none tracking-tight">
                {t.listingTypes[listing.type]}
              </span>
            </span>
            <span className="h-3.5 w-px shrink-0 bg-white/25" aria-hidden />
            <span className="inline-flex items-center gap-1.5 text-white">
              <TermIcon className="h-4 w-4 shrink-0 text-white/90" aria-hidden />
              <span className="whitespace-nowrap text-xs font-medium leading-none">{termLabel}</span>
            </span>
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums tracking-tight text-white">
            {priceText}
            {periodText}
          </span>
        </div>

        {/* Bottom-left title: reference shows only the title here. Location
            lives in the descriptive text below the image. */}
        <h3 className="absolute inset-x-4 bottom-4 text-balance text-xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm">
          {listing.title}
        </h3>
      </Link>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {listing.description}
      </p>
    </article>
  );
}
