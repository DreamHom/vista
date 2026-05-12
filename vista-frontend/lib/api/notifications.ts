import { havenFetch } from "./http";
import { normalizeCount } from "./normalize";
import type { NotificationResponse, Page } from "./types";

export async function listMyNotifications(
  token: string,
  page = 0,
  size = 20,
): Promise<Page<NotificationResponse>> {
  const raw = await havenFetch<Page<NotificationResponse>>("/api/notifications/mine", {
    token,
    query: { page, size },
    cache: "no-store",
  });
  return {
    ...raw,
    content: raw.content.map(normalizeNotification),
  };
}

export async function getUnreadCount(
  token: string,
): Promise<{ count: number }> {
  const raw = await havenFetch<unknown>("/api/notifications/mine/unread-count", {
    token,
    cache: "no-store",
  });
  return {
    count: normalizeCount(raw, ["unread", "notificationsUnread"]),
  };
}

export async function markNotificationRead(
  token: string,
  id: string,
): Promise<NotificationResponse> {
  const raw = await havenFetch<NotificationResponse>(`/api/notifications/${id}/mark-read`, {
    method: "POST",
    token,
    cache: "no-store",
  });
  return normalizeNotification(raw);
}

function normalizeNotification(
  notification: NotificationResponse,
): NotificationResponse {
  return {
    ...notification,
    kind: notification.kind ?? notification.type,
    type: notification.type ?? notification.kind,
    read: notification.read ?? !!notification.readAt,
  };
}
