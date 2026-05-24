"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Turn-taking or waiting state on an offer thread (full border tint, no side stripes). */
export function OfferTurnBanner({
  children,
  variant = "waiting",
  className,
}: {
  children: ReactNode;
  variant?: "waiting" | "your_turn";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "border px-3 py-2 text-sm leading-relaxed",
        variant === "your_turn"
          ? "border-primary/30 bg-primary/5 text-foreground"
          : "border-border bg-secondary/30 text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
