/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, Expand } from "lucide-react";
import {
  Image as NexusImage,
  ImageLightbox,
  ImageLightboxOverlay,
  ImageLightboxPreview,
} from "@/components/nexus-ui/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListingCardMediaProps = {
  listingId: string;
  title: string;
  photoUrl?: string;
  fallbackUrl: string;
  alt: string;
};

/**
 * Nexus UI {@link https://nexus-ui.dev/docs/components/image Image}: hero photo + lightbox zoom,
 * while keeping the main hit-target a normal link into the listing detail page.
 */
export function ListingCardMedia({ listingId, title, photoUrl, fallbackUrl, alt }: ListingCardMediaProps) {
  const src = photoUrl || fallbackUrl;
  const href = `/listings/${listingId}`;

  return (
    <NexusImage
      src={src}
      alt={alt}
      modal
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

        <div className="pointer-events-none absolute right-4 top-4 z-20 opacity-0 transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:opacity-100">
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "pointer-events-auto h-10 w-10 rounded-none border-white/80 bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:border-foreground hover:bg-secondary",
            )}
            aria-label={`Open ${title}`}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <DialogPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "pointer-events-auto absolute bottom-3 right-3 z-30 h-10 w-10 rounded-none border-border/90 bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:border-foreground hover:bg-secondary",
            )}
            aria-label={`Expand photo of ${title}`}
          >
            <Expand className="h-4 w-4" aria-hidden />
          </button>
        </DialogPrimitive.Trigger>

        <ImageLightbox>
          <ImageLightboxOverlay />
          <ImageLightboxPreview
            className={cn(
              "fixed inset-8 z-50 flex !max-h-none !w-full !max-w-none !translate-x-0 !translate-y-0 items-center justify-center overflow-hidden",
              "border border-border bg-background/95 p-3 shadow-2xl outline-none sm:inset-10 sm:p-4",
              "[&_[data-slot=image-lightbox-image]]:mx-auto [&_[data-slot=image-lightbox-image]]:block [&_[data-slot=image-lightbox-image]]:max-h-[calc(100vh-6rem)] [&_[data-slot=image-lightbox-image]]:max-w-[calc(100vw-6rem)]",
              "[&_[data-slot=image-lightbox-image]]:!h-auto [&_[data-slot=image-lightbox-image]]:!w-auto [&_[data-slot=image-lightbox-image]]:object-contain",
            )}
          />
        </ImageLightbox>
      </div>
    </NexusImage>
  );
}
