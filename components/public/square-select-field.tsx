import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Bordered square select — avoids rounded-full slop on dashboard surfaces. */
export function SquareSelectField({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-wrap items-center gap-3 border border-border bg-background px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[10rem] flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}
