import type { NotificationResponse, Role } from "./types";

function asId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function pickDataId(
  data: NotificationResponse["data"],
  keys: string[],
): string | undefined {
  if (!data) return undefined;
  for (const key of keys) {
    const value = data[key];
    const id = asId(value);
    if (id) return id;
  }
  return undefined;
}

export function resolveNotificationHref(
  notification: NotificationResponse,
  role?: Role,
): string | undefined {
  if (notification.href) return notification.href;

  const kind = notification.kind ?? notification.type;
  const listingId = pickDataId(notification.data, [
    "listingId",
    "listing_id",
    "propertyListingId",
  ]);

  switch (kind) {
    case "INSPECTION_REQUESTED":
    case "INSPECTION_CONFIRMED":
    case "OFFER_SUBMITTED":
    case "OFFER_COUNTERED":
    case "OFFER_ACCEPTED":
    case "OFFER_DECLINED":
    case "OFFER_AUTO_DECLINED":
    case "LISTING_APPROVED":
    case "LISTING_TAKEN_DOWN":
    case "LISTING_REPORTED":
    case "COMMENT_REPLIED":
      if (listingId) return `/listings/${listingId}`;
      return "/listings";
    case "ASSIGNMENT_INVITED":
    case "ASSIGNMENT_ACCEPTED":
    case "ASSIGNMENT_DECLINED":
      return role === "OWNER" ? "/owner/agents" : "/agent";
    case "VERIFICATION_APPROVED":
    case "VERIFICATION_REJECTED":
      if (role === "OWNER") return "/owner/verification";
      if (role === "AGENT") return "/agent/credentials";
      if (role === "ADMIN") return "/admin/verifications";
      return "/dashboard/verification";
    default:
      if (role === "OWNER") return "/owner";
      if (role === "AGENT") return "/agent";
      if (role === "ADMIN") return "/admin";
      return "/dashboard";
  }
}
