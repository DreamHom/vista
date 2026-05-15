import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NumberedStepProps {
  /**
   * The decorative numeral: kept as a string so callers can pass "01" / "02"
   * with the leading zero (the design uses these as visual anchors, not as
   * actual ordinals to compute).
   */
  number: string;
  title: string;
  body: string;
  className?: string;
  /**
   * When set (e.g. a Lucide icon), the step renders as a card: square illustration
   * on top, step index + title + body below. Omit for the compact horizontal layout.
   */
  visual?: ReactNode;
}

/**
 * Numbered step: either a compact horizontal row (numeral + copy) or a card
 * with a square illustration frame and copy underneath.
 */
export function NumberedStep({ number, title, body, className, visual }: NumberedStepProps) {
  if (visual) {
    return (
      <article className={cn("flex flex-col gap-5", className)}>
        <div
          aria-hidden
          className={cn(
            "relative flex aspect-square w-full max-w-[min(100%,15.5rem)] shrink-0 items-center justify-center overflow-hidden",
            "border border-border bg-muted",
            "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_30%_18%,hsl(var(--background)/0.45),transparent_58%)]",
          )}
        >
          <span
            className={cn(
              "relative z-[1] text-primary",
              "[&>svg]:size-11 [&>svg]:shrink-0 [&>svg]:stroke-[1.45]",
            )}
          >
            {visual}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground tabular-nums">{number}</p>
          <h3 className="text-lg font-medium tracking-tight text-foreground md:text-xl">{title}</h3>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </article>
    );
  }

  return (
    <div className={cn("flex items-start gap-6", className)}>
      <span
        aria-hidden
        className="text-5xl font-semibold leading-[0.9] tracking-tight text-muted-foreground/40 tabular-nums md:text-6xl"
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-col gap-2 pt-1.5">
        <h3 className="text-lg font-medium tracking-tight text-foreground md:text-xl">{title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
