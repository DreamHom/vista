"use client";

import { useReducedMotion } from "motion/react";

/** Editorial ease — calm deceleration, reads “premium / confident”. */
export const LANDING_EASE = [0.22, 1, 0.36, 1] as const;

/** One-shot reveal as sections enter the reading line. */
export const LANDING_VIEWPORT = {
  once: true as const,
  margin: "-10% 0px -14% 0px" as const,
  amount: 0.12 as const,
};

/**
 * Scroll-driven section: opacity + lift. `storyStep` staggers delay slightly so
 * the page feels like a sequence (discover → deepen → commit), not one blob.
 */
export function landingScrollRevealProps(reduceMotion: boolean, storyStep: number) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      viewport: LANDING_VIEWPORT,
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 44 },
    whileInView: { opacity: 1, y: 0 },
    viewport: LANDING_VIEWPORT,
    transition: {
      duration: 0.72,
      delay: Math.min(storyStep * 0.08, 0.4),
      ease: LANDING_EASE,
    },
  };
}

export function useLandingScrollReveal(storyStep: number) {
  const reduceMotion = useReducedMotion();
  if (storyStep < 0) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      viewport: LANDING_VIEWPORT,
      transition: { duration: 0 },
    };
  }
  return landingScrollRevealProps(Boolean(reduceMotion), storyStep);
}

/** Hero is above the fold — mount animation, not viewport. */
export function useLandingHeroRootMotion() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.45, ease: LANDING_EASE },
  } as const;
}
