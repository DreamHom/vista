import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const motionStyles = {
  /** Default: gentle vertical float (hero scenes, large marks). */
  float: "motion-safe:animate-ambient-float",
  /** Secondary layer, slightly offset timing via keyframes delay. */
  "float-delayed": "motion-safe:animate-ambient-float-delayed",
  /** Opacity pulse — suns, glows, distant strokes. */
  breathe: "motion-safe:animate-ambient-breathe",
  /** Tiny figure-eight drift — decorative clusters. */
  drift: "motion-safe:animate-ambient-drift",
  none: "",
} as const;

export type AmbientMotion = keyof typeof motionStyles;

type AmbientFrameProps = {
  children: ReactNode;
  /** Visual motion intent; always respects `prefers-reduced-motion` via `motion-safe:`. */
  motion?: AmbientMotion;
  className?: string;
  /** When true, keeps layout width but hides from AT (use for purely decorative clusters). */
  decorative?: boolean;
};

/**
 * Wraps inline SVG or illustration clusters with **slow, looping** motion.
 * Use for editorial pages: motion stays peripheral so copy stays readable.
 */
export function AmbientFrame({ children, motion = "float", className, decorative }: AmbientFrameProps) {
  return (
    <div
      className={cn(
        motion !== "none" && "will-change-transform",
        motionStyles[motion],
        decorative && "pointer-events-none select-none",
        className,
      )}
      aria-hidden={decorative ? true : undefined}
    >
      {children}
    </div>
  );
}
