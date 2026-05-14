"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Magazine-style location stamp with a live clock.
 *
 *   <LocationTime country="Nigeria" state="Lagos" timezone="Africa/Lagos" />
 *
 * Renders as:
 *
 *   Nigeria               ← bold
 *   Lagos · 14:30:22      ← updates once per second
 *
 * Hydration: server emits a static placeholder (`--:--:--`) so the markup
 * is identical on server and the first client render: no hydration
 * mismatch warnings. On mount we replace the placeholder with the real
 * time and tick every second.
 */
export interface LocationTimeProps {
  country: string;
  state: string;
  /** IANA timezone like `Africa/Lagos`. */
  timezone: string;
  className?: string;
}

const PLACEHOLDER_TIME = "--:--:--";

export function LocationTime({ country, state, timezone, className }: LocationTimeProps) {
  const [time, setTime] = useState(PLACEHOLDER_TIME);

  useEffect(() => {
    const tick = () => setTime(formatTime(timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <div className={cn("flex flex-col gap-0.5 text-xs leading-tight md:text-sm", className)}>
      <span className="font-semibold tracking-tight text-foreground">{country}</span>
      <span className="text-muted-foreground tabular-nums" suppressHydrationWarning>
        {state} &middot; {time}
      </span>
    </div>
  );
}

/** Render `HH:MM:SS` in the given IANA timezone, 24-hour, locale-agnostic. */
function formatTime(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("hour")}:${get("minute")}:${get("second")}`;
}
