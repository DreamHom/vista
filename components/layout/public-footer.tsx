"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Bebas_Neue } from "next/font/google";
import { AtSign, Camera, Mail, MessageCircle } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { MoniepointMark } from "@/components/partners/moniepoint-mark";
import { PUBLIC_FOOTER_LINKS, PUBLIC_PRIMARY_NAV } from "@/lib/public-site";
import { useLandingScrollReveal } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";

const partnerBannerDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SOCIAL = [
  { href: "#", label: "Follow on X", icon: AtSign },
  { href: "#", label: "Follow on Instagram", icon: Camera },
  { href: "#", label: "Follow on Threads", icon: MessageCircle },
  { href: "mailto:hello@dreamhomes.today", label: "Email us", icon: Mail },
] as const;

/**
 * Section 08: Public footer.
 *
 * @param landingStoryStep — When set (e.g. home `6`), footer eases in as the last beat of the landing story.
 */
export function PublicFooter({ landingStoryStep = -1 }: { landingStoryStep?: number }) {
  const motionProps = useLandingScrollReveal(landingStoryStep);
  return (
    <motion.footer className="font-sans" {...motionProps}>
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr] md:py-16">
        <div className="space-y-4">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            DreamHomes is building a calmer, trust-first way to discover, verify, and move on property in Nigeria.
          </p>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_PRIMARY_NAV.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PUBLIC_FOOTER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="container border-t border-border py-8">
        <Link
          href="/moniepoint-financing"
          aria-label="Strong Partners with Moniepoint — read about DreamHomes financing"
          className="group relative isolate block w-full min-h-[11.5rem] overflow-hidden border-2 border-foreground/10 bg-muted/15 transition-colors hover:border-foreground/20 hover:bg-muted/25 md:min-h-[15rem]"
        >
          {/* Poster-style ground + shapes (banner graphic) */}
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12)_0%,transparent_42%,hsl(var(--muted)/0.5)_100%)]" aria-hidden />
          <span
            className="pointer-events-none absolute -bottom-8 -right-6 h-44 w-44 rounded-full bg-primary/25 blur-3xl md:h-56 md:w-56"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -left-16 top-1/2 h-[140%] w-28 -translate-y-1/2 rotate-[11deg] bg-foreground/[0.06] md:w-36"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-4 top-0 h-full w-[min(42%,11rem)] skew-x-[-10deg] bg-primary/10 md:w-[min(38%,14rem)]"
            aria-hidden
          />

          <span
            className={cn(
              partnerBannerDisplay.className,
              "absolute left-3 right-[9.25rem] top-3 z-10 text-[clamp(2.65rem,11vw,5.75rem)] leading-[0.88] tracking-[0.04em] text-foreground md:left-8 md:right-[13rem] md:top-6",
            )}
          >
            <span className="block drop-shadow-sm">STRONG</span>
            <span className="block text-primary drop-shadow-sm">PARTNERS</span>
          </span>

          <span
            className={cn(
              partnerBannerDisplay.className,
              "absolute bottom-3 left-3 z-10 text-[clamp(1.35rem,4.2vw,2.15rem)] leading-none tracking-[0.28em] text-muted-foreground md:bottom-5 md:left-8",
            )}
          >
            WITH
          </span>

          <div className="absolute bottom-3 right-3 z-10 flex items-end md:bottom-6 md:right-8">
            <MoniepointMark
              align="left"
              className="h-10 w-[168px] opacity-95 drop-shadow-sm transition-opacity group-hover:opacity-100 md:h-11 md:w-[188px]"
            />
          </div>
        </Link>
      </div>

      <div className="container flex justify-center border-y border-border py-8">
        <LogoMark size="lg" />
      </div>

      <div className="container grid grid-cols-1 gap-8 py-8 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-eyebrow text-muted-foreground">Phone</span>
          <span className="text-sm text-foreground">+234 (0) 800 0000 000</span>
        </div>
        <div className="flex flex-col gap-1 sm:items-end sm:text-right">
          <span className="text-xs uppercase tracking-eyebrow text-muted-foreground">Address</span>
          <span className="text-sm text-foreground">23 Admiralty Way, Lekki Phase 1, Lagos</span>
        </div>
      </div>

      <div className="bg-foreground text-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <span className="text-xs text-background/60">
            © {new Date().getFullYear()} DreamHomes. All rights reserved.
          </span>
          <nav className="flex items-center gap-3">
            {SOCIAL.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="p-1.5 text-background/70 transition-colors hover:bg-background/10 hover:text-background"
              >
                <item.icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </motion.footer>
  );
}
