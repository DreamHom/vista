import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FilterPillOption {
  value: string;
  label: string;
  /** Optional href: when provided, the pill renders as a `<Link>`. */
  href?: string;
  /** Optional leading icon (e.g. same set as listings toolbar). */
  icon?: LucideIcon;
}

export interface FilterPillsProps {
  options: FilterPillOption[];
  selected?: string;
  className?: string;
  /** Visual size: `sm` is the secondary row, `md` (default) is the primary. */
  size?: "sm" | "md";
}

/**
 * Segmented control / filter pills, matching the reference: sharp-edged,
 * black-fill on the selected state, hairline outline on the rest. No shadow.
 *
 * Decorative on the landing: when an `href` is provided each pill links
 * out to a filtered listings index. Real interactivity (URL param sync,
 * client-side filter) lands when we build `/listings`.
 */
export function FilterPills({ options, selected, className, size = "md" }: FilterPillsProps) {
  const heightClass = size === "sm" ? "min-h-8 px-3 py-1.5 text-xs" : "min-h-9 px-4 py-2 text-sm";
  const gapClass = size === "sm" ? "gap-px" : "gap-2";
  const iconClass = size === "sm" ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0";

  return (
    <div className={cn("flex flex-wrap items-center", gapClass, className)}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        const Icon = option.icon;
        const baseClass = cn(
          "inline-flex items-center justify-center gap-2 border font-medium transition-colors",
          heightClass,
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-secondary",
        );

        const inner = (
          <>
            {Icon ? <Icon className={cn(iconClass, "opacity-90")} aria-hidden /> : null}
            <span className="leading-tight">{option.label}</span>
          </>
        );

        if (option.href) {
          return (
            <Link key={option.value} href={option.href} className={baseClass}>
              {inner}
            </Link>
          );
        }

        return (
          <span key={option.value} className={baseClass}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}
