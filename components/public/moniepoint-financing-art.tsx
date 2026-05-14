import { cn } from "@/lib/utils";

export function MoniepointWhatIsGlyph({ index }: { index: 0 | 1 | 2 }) {
  const common = "h-12 w-12 shrink-0 text-foreground md:h-14 md:w-14";
  if (index === 0) {
    return (
      <svg className={common} viewBox="0 0 40 40" fill="none" aria-hidden>
        <path d="M8 32V18l12-8 12 8v14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 32V24h8v8" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="20" cy="14" r="2" fill="currentColor" fillOpacity="0.35" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg className={common} viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="9" y="11" width="22" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13 17h14M13 22h10M13 27h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M26 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
      <path d="M12 20h16M20 12v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MoniepointBridgeBand({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-muted-foreground", className)}
      viewBox="0 0 560 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 28c60-18 120-18 180 0s120 18 180 0 120-18 176-4"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 10"
        className="motion-safe:animate-ambient-dash"
      />
      {[72, 200, 328, 456].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="28"
          r="4"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeOpacity="0.35"
          className="motion-safe:animate-ambient-breathe"
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </svg>
  );
}
