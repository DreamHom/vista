"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  collection,
  FEATURED_COLLECTION_ID,
  photoStreams,
  photosOf,
} from "@/lib/seed/collections";
import { useTranslations } from "@/lib/i18n/provider";
import { LogoMark } from "@/components/logo";
import { PublicAuthDesktopCluster, PublicAuthMobileCluster } from "@/components/layout/public-auth-cluster";
import { PUBLIC_PRIMARY_NAV } from "@/lib/public-site";
import { LANDING_EASE, useLandingHeroRootMotion } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { HeroCarousel } from "./hero-carousel";
import { LocationTime } from "./location-time";

/**
 * Section 01: Hero. See `docs/collections.md` for the curation model.
 *
 * Motion is a short story: frame → wayfinding → promise → context → proof strip.
 */
export function Hero() {
  const { t } = useTranslations();
  const featured = collection(FEATURED_COLLECTION_ID);
  const heroPhotos = photosOf(featured);
  const thumbStreams = photoStreams(featured, 3);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const heroRoot = useLandingHeroRootMotion();

  const beat = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.58, delay, ease: LANDING_EASE },
        };

  return (
    <motion.section {...heroRoot}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[9fr_11fr]">
        {/* Beat 1 — editorial frame: hero stills (desktop). */}
        <motion.div className="hidden lg:block lg:p-1.5" {...beat(reduceMotion ? 0 : 0.06)}>
          <div className="relative h-full overflow-hidden">
            <HeroCarousel photos={heroPhotos} />
          </div>
        </motion.div>

        {/* Right column: `min-w-0` so flex children don't push the column
            wider than the grid track on narrow viewports. */}
        <div className="flex min-w-0 flex-col px-[9px] pb-1.5 pt-[9px] lg:pl-1.5">
          {/* Beat 2 — wayfinding: who we are + where to go. */}
          <motion.header
            className="flex items-center justify-between gap-6 px-2 py-3 md:px-3 md:py-5"
            {...beat(reduceMotion ? 0 : 0.12)}
          >
            <Link href="/" aria-label="DreamHomes home">
              <LogoMark size="xl" className="md:hidden" />
              <LogoMark size="md" className="hidden md:inline-flex" />
            </Link>
            <nav className="hidden items-center gap-5 xl:flex">
              {PUBLIC_PRIMARY_NAV.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap text-sm font-medium tracking-tight text-foreground transition-colors hover:text-accent",
                    index >= 3 && "hidden 2xl:inline-flex",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <PublicAuthDesktopCluster className="hidden shrink-0 2xl:flex [&_a]:whitespace-nowrap" />
            {/* Mobile/tab hamburger: opens the drawer. 44×44 tap target
                (Apple HIG minimum) with `touch-manipulation` to kill the
                300ms tap delay some mobile browsers add. `cursor-pointer`
                so even hover-capable phones get the affordance. */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center text-foreground transition-colors hover:text-accent 2xl:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </motion.header>

          {/* Beat 3 — promise: headline holds the value prop. */}
          <motion.div className="flex flex-1 flex-col justify-center px-2 md:px-3" {...beat(reduceMotion ? 0 : 0.22)}>
            <h1 className="text-balance text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
              {t.hero.headline}{" "}
              <span className="text-accent">{t.hero.headlineAccent}</span>
            </h1>
          </motion.div>

          {/* Beat 4 — context: place + language (trust / locality). */}
          <motion.div
            className="mb-3 flex items-center justify-between gap-3 px-2 md:px-3"
            {...beat(reduceMotion ? 0 : 0.32)}
          >
            <LocationTime
              country={t.hero.country}
              state={featured.state}
              timezone={featured.timezone}
              className="shrink-0"
            />
            <LanguageToggle className="shrink-0 self-center" />
          </motion.div>

          {/* Beat 5 — proof texture: three frames pull you toward inventory. */}
          <div className="grid grid-cols-3 gap-3">
            {thumbStreams.map((photos, i) => (
              <motion.div
                key={i}
                className="relative aspect-[4/5] overflow-hidden"
                {...beat(reduceMotion ? 0 : 0.4 + i * 0.07)}
              >
                <HeroCarousel
                  photos={photos}
                  intervalMs={9000}
                  startIndex={i}
                  width={600}
                  ratio="4:5"
                  priorityFirst={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/tab drawer: full-height sheet from the right with large
          nav links. Hidden on lg+ where the inline nav is sufficient. */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 cursor-pointer touch-manipulation bg-foreground/30 backdrop-blur-sm 2xl:hidden"
            />
            {/* Drawer panel: slides in from the right */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-background p-6 2xl:hidden"
            >
              <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex min-h-11 min-w-0 flex-1 items-center">
                  <LogoMark size="lg" className="min-w-0" />
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center text-foreground transition-colors hover:text-accent"
                >
                  <X className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {PUBLIC_PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="border-b border-border py-4 text-3xl font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto space-y-3 pt-6">
                <PublicAuthMobileCluster variant="hero" onNavigate={() => setDrawerOpen(false)} />
                <LanguageToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
