import { cn } from "@/lib/utils";

export interface NumberedStepProps {
  /** Decorative numeral ("01", "02", …). */
  number: string;
  title: string;
  body: string;
  className?: string;
  /**
   * `grid` — value-prop cells: large muted numeral, room for a short paragraph.
   * `list` — services stack: same row, slightly tighter rhythm.
   */
  density?: "grid" | "list";
}

/**
 * Horizontal step row — numeral left, title + body right (see
 * `design-reference/landing-page/03-value-proposition.png`).
 */
export function NumberedStep({ number, title, body, className, density = "grid" }: NumberedStepProps) {
  const isList = density === "list";

  return (
    <article
      className={cn(
        "flex min-w-0 items-start",
        isList ? "gap-5 sm:gap-6" : "gap-4 sm:gap-5 md:gap-6",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "shrink-0 font-semibold leading-[0.9] tracking-tight text-muted-foreground/40 tabular-nums",
          isList
            ? "text-4xl sm:text-5xl md:text-6xl"
            : "text-5xl sm:text-6xl md:text-[3.25rem] lg:text-7xl",
        )}
      >
        {number}
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1.5",
          isList ? "pt-0.5 sm:pt-1" : "gap-2 pt-1 sm:pt-1.5 md:pt-2",
        )}
      >
        <h3
          className={cn(
            "text-pretty font-medium tracking-tight text-foreground",
            isList ? "text-base md:text-lg" : "text-lg md:text-xl",
          )}
        >
          {title}
        </h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}
