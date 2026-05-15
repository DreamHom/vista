"use client";

import { useReducedMotion } from "motion/react";

/**
 * Cubic-bezier eases (all components use explicit curves — no string "easeOut").
 * Tweaked for hero: weighty deceleration without feeling sluggish.
 */
export const HERO_EASE_LEFT = [0.22, 0.99, 0.37, 1] as const;
export const HERO_EASE_THUMB = [0.16, 1, 0.3, 1] as const;
export const HERO_EASE_TEXT = [0.33, 1, 0.68, 1] as const;
export const HERO_EASE_ROOT = [0.25, 0.46, 0.45, 0.94] as const;

/** Durations / overlaps: thumbs stagger while the left card is still moving. */
export const LANDING_HERO = {
  rootFadeDuration: 0.55,
  leftEnterPx: 72,
  leftDuration: 1.22,
  leftDelay: 0.04,
  thumbEnterPx: 56,
  thumbDuration: 0.9,
  /** First thumb starts while left panel is mid-flight. */
  thumbDelayStart: 0.14,
  thumbStagger: 0.11,
  textLiftPx: 44,
  textDuration: 1,
  /** Whole text stack (nav + headline + meta) after thumbs are underway. */
  textDelayStart: 0.78,
} as const;

/** Large left frame: travels left → right (starts off-screen left). */
export function heroLeftPanelMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    return {
      initial: { x: 0, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { x: -LANDING_HERO.leftEnterPx, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: {
      duration: LANDING_HERO.leftDuration,
      delay: LANDING_HERO.leftDelay,
      ease: HERO_EASE_LEFT,
    },
  } as const;
}

/** Three proof cards: enter from the right, staggered during the left panel move. */
export function heroThumbCardMotion(reduceMotion: boolean, index: number) {
  if (reduceMotion) {
    return {
      initial: { x: 0, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { x: LANDING_HERO.thumbEnterPx, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: {
      duration: LANDING_HERO.thumbDuration,
      delay: LANDING_HERO.thumbDelayStart + (2 - index) * LANDING_HERO.thumbStagger,
      ease: HERO_EASE_THUMB,
    },
  } as const;
}

/** Headline + locale: one block rising bottom → top (after cards get moving). */
export function heroTextStackMotion(reduceMotion: boolean) {
  if (reduceMotion) {
    return {
      initial: { y: 0, opacity: 1 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0 },
    } as const;
  }
  return {
    initial: { y: LANDING_HERO.textLiftPx, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: {
      duration: LANDING_HERO.textDuration,
      delay: LANDING_HERO.textDelayStart,
      ease: HERO_EASE_TEXT,
    },
  } as const;
}

/** Whole hero: light curtain-up so content isn’t visible before staged motion. */
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
    transition: { duration: LANDING_HERO.rootFadeDuration, ease: HERO_EASE_ROOT },
  } as const;
}
