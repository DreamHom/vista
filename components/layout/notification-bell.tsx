"use client";

/**
 * Notification bell with live unread badge.
 *
 * - Renders a Link to the role-correct notifications page.
 * - Fetches the unread count from `GET /notifications/mine/unread-count`
 *   (Haven v1.0.4) via TanStack Query, cache key
 *   `["unread-notification-count", userId]`.
 * - Polls every 60s as a safety net; the SSE stream
 *   (lib/notifications-stream.ts) is the primary source of truth and bumps
 *   the cache immediately on each event.
 * - Badge: small square pill (sharp corners per brand `--radius: 0`),
 *   bg-accent with white text. Shows count up to 9, then "9+". Hidden when
 *   the count is 0 so the bell doesn't shout when there's nothing to read.
 */

import Link from "next/link";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { buttonVariants } from "@/components/ui/button";
import { getUnreadNotificationCount } from "@/lib/applicant-dashboard";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export function NotificationBell({
  href,
  className,
  size = "default",
}: {
  href: string;
  className?: string;
  /** `default` for header use, `small` for tight chrome (mobile cluster, etc). */
  size?: "default" | "small";
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const userId = useAuthStore((s) => s.user?.id);

  const query = useQuery({
    queryKey: ["unread-notification-count", userId],
    queryFn: getUnreadNotificationCount,
    enabled: hydrated && !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const count = query.data ?? 0;
  const dimensions = size === "small" ? "h-9 w-9" : "h-10 w-10";
  const display = count > 9 ? "9+" : String(count);

  return (
    <Link
      href={href}
      aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative shrink-0",
        dimensions,
        className,
      )}
    >
      <Bell className="h-4 w-4" aria-hidden />
      {count > 0 ? (
        <span
          aria-hidden
          className={cn(
            "absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center",
            "border border-background bg-accent px-1 text-[10px] font-semibold leading-none tabular-nums text-accent-foreground",
            // Keep height matching the min-width for square edges on single
            // digits; the px-1 lets two-character "9+" / "10" breathe.
            "h-4",
          )}
        >
          {display}
        </span>
      ) : null}
    </Link>
  );
}
