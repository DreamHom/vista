"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LISTINGS } from "@/lib/seed/listings";
import { photoUrl } from "@/lib/seed/photos";
import { LANDING_TOPIC_VIDEO_SRC } from "@/lib/content/landing-topic-videos";
import { useTranslations } from "@/lib/i18n/provider";
import { interpolate } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

/**
 * Section 04: Shorts Video (the dark inversion).
 *
 * Each topic tab swaps a muted looping clip with an Unsplash **WebP** poster
 * (`photoUrl` defaults). Clips are self-hosted under `/public/landing/` — see
 * `lib/content/landing-topic-videos.ts` to swap in your own MP4s (Pexels /
 * Coverr / etc. are easiest if you download first; hotlinking often 403s).
 */
const TOPIC_PHOTOS = [
  LISTINGS[0].photos[0],
  LISTINGS[1].photos[0],
  LISTINGS[2].photos[0],
  LISTINGS[6].photos[0],
  LISTINGS[9].photos[0],
];

export function ShortsVideo() {
  const { t } = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === activeIndex) {
        void el.play().catch(() => {});
      } else {
        el.pause();
        try {
          el.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    });
  }, [activeIndex]);

  return (
    <section className="bg-foreground text-background">
      <div className="container py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <span className="text-xs font-medium uppercase tracking-eyebrow text-background/60">
              {t.shorts.eyebrow}
            </span>
            <ul className="flex flex-col gap-2">
              {t.shorts.topics.map((topic, i) => {
                const isActive = i === activeIndex;
                return (
                  <li key={topic}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      onClick={() => setActiveIndex(i)}
                      aria-pressed={isActive}
                      className={cn(
                        "cursor-pointer touch-manipulation text-left text-3xl font-semibold tracking-tight transition-colors md:text-5xl",
                        isActive
                          ? "text-background"
                          : "text-background/40 hover:text-background/80",
                      )}
                    >
                      {topic}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {TOPIC_PHOTOS.map((photo, i) => {
                const videoSrc = LANDING_TOPIC_VIDEO_SRC[i];
                const poster = photoUrl(photo, { w: 960, ratio: "4:3", q: 88 });
                return (
                  <motion.div
                    key={photo.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: i === activeIndex ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {videoSrc ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                        poster={poster}
                        src={videoSrc}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={photo.alt}
                      />
                    ) : (
                      <Image
                        src={poster}
                        alt={photo.alt}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                        priority={i === 0}
                      />
                    )}
                  </motion.div>
                );
              })}
              <div className="pointer-events-none absolute inset-0 bg-black/15" aria-hidden />
              <button
                type="button"
                aria-label="Preview video"
                className="absolute inset-0 m-auto flex h-12 w-12 cursor-pointer items-center justify-center bg-background/0 text-background/0 transition-all hover:bg-background/90 hover:text-foreground"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-background">{t.shorts.featuredCaption}</span>
              <span className="tabular-nums text-background/60">
                {interpolate(t.shorts.viewsLabel, { n: "100" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
