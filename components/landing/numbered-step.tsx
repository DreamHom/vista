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
   * Optional small icon, rendered inline next to the title (≈ 16px). Sits as
   * a quiet trust mark beside the copy — the *numeral* is what carries the
   * flow, the icon just hints at the step's topic. Pass `null` (or omit) to
   * skip the icon entirely.
   */
  visual?: ReactNode;
}

/**
 * Editorial step block.
 *
 * Layout: a big decorative numeral takes the visual lead, with a hairline
 * rule, then title (with optional inline icon) and body. Sized to read at
 * a glance in a 2×2 grid (`ValueProposition`) or stacked in a column
 * (`Services` services list).
 */
export function NumberedStep({ number, title, body, className, visual }: NumberedStepProps) {
  return (
    <article className={cn("flex min-w-0 flex-col gap-4", className)}>
      <p
        aria-hidden
        className="text-6xl font-semibold leading-none tracking-tight text-foreground tabular-nums md:text-7xl lg:text-8xl"
      >
        {number}
      </p>

      <span aria-hidden className="block h-px w-10 bg-foreground" />

      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="flex items-center gap-2 text-lg font-medium tracking-tight text-foreground md:text-xl">
          {visual ? (
            <span
              aria-hidden
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-accent [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.75]"
            >
              {visual}
            </span>
          ) : null}
          <span className="min-w-0">{title}</span>
        </h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}
