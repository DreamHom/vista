"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LANDING_TOPIC_VIDEO_SRC } from "@/lib/content/landing-topic-videos";
import { useTranslations } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/** Poster stills for each topic tab (typically the first photo of live listings). */
export type ShortsPosterPhoto = {
  id: string;
  url: string;
  alt: string;
};

/**
 * Section 04: Shorts Video (the dark inversion).
 *
 * Each topic tab swaps a muted looping clip with a poster image. Clips live
 * under `/public/landing/` — see `lib/content/landing-topic-videos.ts`.
 */
export function ShortsVideo({ posters }: { posters: ShortsPosterPhoto[] }) {
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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-stretch lg:gap-16">
          <div className="flex flex-col gap-8">
            <span className="text-xs font-medium uppercase tracking-eyebrow text-background/60">
              {t.shorts.eyebrow}
            </span>
            <ul className="flex flex-col gap-2.5 md:gap-3">
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
                        "block w-full cursor-pointer touch-manipulation py-0.5 text-left text-3xl font-semibold tracking-tight transition-colors md:text-5xl",
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

          <div className="flex min-h-0 flex-col lg:h-full">
            <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden bg-muted lg:aspect-auto lg:min-h-0 lg:flex-1">
              {posters.slice(0, t.shorts.topics.length).map((photo, i) => {
                const videoSrc = LANDING_TOPIC_VIDEO_SRC[i];
                const posterUrl = photo.url;
                return (
                  <motion.div
                    key={`${photo.id}-${i}`}
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
                        poster={posterUrl}
                        src={videoSrc}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={photo.alt}
                      />
                    ) : (
                      <Image
                        src={posterUrl}
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
          </div>
        </div>
      </div>
    </section>
  );
}
