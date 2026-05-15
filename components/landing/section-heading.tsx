import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /** The big multi-line headline. */
  title: string;
  /** Tiny eyebrow tag above the headline (e.g. "Featured", "Shorts Video"). */
  eyebrow?: string;
  /** Right-aligned supporting paragraph at the headline's height. */
  supporting?: string;
  /**
   * Right-aligned action node: typically a "See all →" link, sized small.
   * Sits below the supporting paragraph if both are provided.
   */
  action?: ReactNode;
  className?: string;
}

/**
 * Section header pattern from the reference: huge tracking-tight grotesque
 * on the left, with optional supporting copy and a tiny action link aligned
 * to the right.
 */
export function SectionHeading({
  title,
  eyebrow,
  supporting,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-[1fr_minmax(0,360px)] md:items-end md:gap-12",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        {eyebrow ? (
          <span className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-tight md:text-5xl lg:text-6xl">
          {title}
        </h2>
      </div>

      {(supporting || action) && (
        <div className="flex flex-col items-start gap-3 md:items-end md:text-right">
          {supporting ? (
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{supporting}</p>
          ) : null}
          {action}
        </div>
      )}
    </div>
  );
}
