"use client";

/**
 * Mounts the notifications SSE stream globally when a user is signed in.
 *
 * Each event from haven's `/notifications/stream` (Kafka or sync source) fires:
 *   1. A top-right toast with the role-correct deep link to "Open"
 *   2. A TanStack Query invalidation so the notifications page refetches
 *   3. An unread-count cache nudge so the bell badge updates immediately
 *
 * Why a global provider:
 *   - One SSE connection per tab (not per page), so toasts arrive on the
 *     listings detail page just as well as on /dashboard.
 *   - React Query's invalidation propagates to any mounted notifications
 *     queries.
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createNotificationStream } from "@/lib/notifications-stream";
import { useAuthStore } from "@/lib/auth-store";
import { getNotificationHref, type NotificationResponse } from "@/lib/applicant-dashboard";
import { notificationDisplayCopy } from "@/lib/notification-display";
import { toast } from "@/components/ui/toast";

export function NotificationsStreamProvider() {
  const queryClient = useQueryClient();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);

  // Latest values referenced inside the stream lifecycle without restarting
  // the connection every render. The stream itself only restarts on auth
  // changes (token/userId).
  const roleRef = useRef(role);
  roleRef.current = role;

  useEffect(() => {
    if (!hydrated || !token || !userId) return;

    const controller = createNotificationStream(
      () => useAuthStore.getState().token,
      {
        onEvent: ({ notification }) => {
          const { title, body } = notificationDisplayCopy(notification);
          const href = getNotificationHref(notification, roleRef.current ?? null);

          toast(title, {
            description: body || undefined,
            position: "top-right",
            action: {
              label: "Open",
              onClick: () => {
                if (typeof window !== "undefined") window.location.assign(href);
              },
            },
            // Long-ish but not sticky: realtime events shouldn't pile up
            // forever, but the user should have time to read + click Open.
            duration: 8_000,
          });

          // Refetch the per-role notification list + the unread count badge.
          void queryClient.invalidateQueries({ queryKey: notificationListKeysForRole(roleRef.current) });
          void queryClient.invalidateQueries({ queryKey: ["unread-notification-count", userId] });

          // Optimistic bump: in case the count query is debounced/stale,
          // increment the cached value so the bell updates instantly.
          queryClient.setQueryData<number>(
            ["unread-notification-count", userId],
            (prev) => (typeof prev === "number" ? prev + 1 : prev),
          );

          // Side-effects for specific notification kinds: invalidate the
          // page-level queries those notifications affect. Cheap; saves a
          // manual refresh after Kafka events.
          void invalidateForNotificationKind(queryClient, notification, userId);
        },
        onUnauthorized: () => {
          // Stream dropped because of 401. The api-level refresh-and-retry
          // path will kick in on the next user action; we don't need to do
          // anything special here besides letting the stream stop.
        },
      },
    );

    return () => controller.close();
  }, [hydrated, token, userId, queryClient]);

  return null;
}

function notificationListKeysForRole(role: string | null | undefined): unknown[] {
  if (role === "OWNER") return ["owner-notifications"];
  if (role === "AGENT") return ["agent-notifications"];
  return ["applicant-notifications"];
}

async function invalidateForNotificationKind(
  queryClient: ReturnType<typeof useQueryClient>,
  notification: NotificationResponse,
  userId: number,
) {
  const kind = notification.kind;
  // Notifications driven by Kafka events: inspection requests + offer
  // submissions. Touch the inspection / offer queries so the dashboard
  // updates without a manual refresh.
  if (kind.startsWith("INSPECTION")) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["applicant-inspections", userId] }),
      queryClient.invalidateQueries({ queryKey: ["owner-inspections", userId] }),
      queryClient.invalidateQueries({ queryKey: ["agent-inspections", userId] }),
    ]);
  }
  if (kind.startsWith("OFFER")) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["applicant-offers", userId] }),
      queryClient.invalidateQueries({ queryKey: ["owner-offers", userId] }),
      queryClient.invalidateQueries({ queryKey: ["agent-offers", userId] }),
    ]);
  }
}
