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
}

/**
 * Editorial-style numbered step: huge gray "01" sitting beside a small
 * heading + body paragraph. The numeral is decorative: it sets the rhythm
 * for the section without competing with the actual content.
 */
export function NumberedStep({ number, title, body, className }: NumberedStepProps) {
  return (
    <div className={cn("flex items-start gap-6", className)}>
      <span
        aria-hidden
        className="text-5xl font-semibold leading-[0.9] tracking-tight text-muted-foreground/40 tabular-nums md:text-6xl"
      >
        {number}
      </span>
      <div className="flex flex-col gap-2 pt-1.5">
        <h3 className="text-lg font-medium tracking-tight text-foreground md:text-xl">{title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
