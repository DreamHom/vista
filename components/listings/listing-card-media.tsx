/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Image as NexusImage } from "@/components/nexus-ui/image";

type ListingCardMediaProps = {
  listingId: string;
  photoUrl?: string;
  fallbackUrl: string;
  alt: string;
};

/**
 * Nexus UI {@link https://nexus-ui.dev/docs/components/image Image}: hero photo + lightbox zoom,
 * while keeping the main hit-target a normal link into the listing detail page.
 */
export function ListingCardMedia({ listingId, photoUrl, fallbackUrl, alt }: ListingCardMediaProps) {
  const src = photoUrl || fallbackUrl;
  const href = `/listings/${listingId}`;

  return (
    <NexusImage
      src={src}
      alt={alt}
      className="aspect-auto min-h-0 w-full min-w-0 max-w-none flex-col overflow-hidden rounded-none border-0 bg-muted shadow-none dark:border-0"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Link href={href} className="absolute inset-0 z-0 block">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/image:scale-[1.03]"
          />
        </Link>
      </div>
    </NexusImage>
  );
}
