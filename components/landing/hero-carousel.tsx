"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { photoUrl, type SeedPhoto } from "@/lib/seed/photos";
import { cn } from "@/lib/utils";

/**
 * Auto-cycling hero photo with cross-fade between slides.
 *
 *  - All slides render absolutely-positioned, stacked. Only opacity changes
 *    on transition: no layout shift, no flash. The browser keeps every
 *    photo decoded after first paint, so subsequent cycles are smooth.
 *  - The first slide gets `priority` for LCP; the rest load eagerly behind
 *    it (they need to be ready before their turn to fade in).
 *  - Pauses cycling when the document tab is hidden: saves bandwidth and
 *    avoids the "I came back and it skipped 12 slides" snap.
 *  - Caller controls the wrapper aspect / size; we just fill it.
 */
export interface HeroCarouselProps {
  photos: SeedPhoto[];
  /**
   * Milliseconds between slides. Defaults to 9000: long enough to absorb
   * the photograph, short enough to keep the page alive.
   */
  intervalMs?: number;
  /**
   * Initial slide index. Pass different values across sibling carousels so
   * they start on different photos: keeps the page from looking like one
   * synchronised slideshow.
   */
  startIndex?: number;
  /**
   * CDN width hint passed through to `photoUrl`. Match the rendered size:
   *  • 1600 for the main hero (default)
   *  • 600 for the smaller thumb strip
   */
  width?: number;
  /**
   * Aspect-ratio crop requested from the CDN. Pass the same ratio that the
   * carousel's container is rendering at so `object-cover` doesn't have to
   * compensate by clipping. Defaults to `3:2`.
   */
  ratio?: "1:1" | "4:5" | "4:3" | "3:2" | "16:9" | "21:9";
  /** Render the first slide with priority: set on the LCP candidate only. */
  priorityFirst?: boolean;
  className?: string;
}

export function HeroCarousel({
  photos,
  intervalMs = 9000,
  startIndex = 0,
  width = 1600,
  ratio = "3:2",
  priorityFirst = true,
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(() => startIndex % Math.max(photos.length, 1));

  useEffect(() => {
    if (photos.length <= 1) return;

    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id != null) return;
      id = setInterval(() => {
        setIndex((current) => (current + 1) % photos.length);
      }, intervalMs);
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    };

    start();
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [photos.length, intervalMs]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {photos.map((photo, i) => (
        <Image
          key={photo.id}
          src={photoUrl(photo, { w: width, ratio })}
          alt={photo.alt}
          fill
          unoptimized
          priority={priorityFirst && i === startIndex}
          sizes={width >= 1200 ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 20vw, 33vw"}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
