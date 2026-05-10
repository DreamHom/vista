import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  delta,
  icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  icon?: ReactNode;
  tone?: "neutral" | "positive" | "negative";
  className?: string;
}) {
  const deltaColor =
    tone === "positive"
      ? "text-success"
      : tone === "negative"
        ? "text-danger"
        : "text-fg-muted";
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-bg-elevated p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-fg-muted">{label}</p>
        {icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-fg">{value}</p>
      {delta && <p className={cn("mt-1 text-xs font-medium", deltaColor)}>{delta}</p>}
    </div>
  );
}
