"use client";

import { LOCALES } from "@/lib/i18n";
import { useTranslations } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Segmented EN/YO/IG/HA selector. Switches the active locale via context and
 * persists to localStorage. Mobile cells are larger for tap targets; desktop
 * cells sit alongside the inline nav.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslations();

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "flex w-fit shrink-0 items-center border border-border bg-background",
        className,
      )}
    >
      {LOCALES.map((option) => {
        const isSelected = option.code === locale;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            onClick={() => setLocale(option.code)}
            className={cn(
              // Roomier on mobile so each cell reads as a real tappable
              // surface; tighter on desktop where the toggle sits alongside
              // the inline nav.
              "shrink-0 cursor-pointer touch-manipulation px-3.5 py-3 text-xs font-medium uppercase tracking-eyebrow transition-colors md:px-3 md:py-2 md:text-[11px]",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
}
