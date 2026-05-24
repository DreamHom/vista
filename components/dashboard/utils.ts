import type { EnrichedInspection, NotificationKind, OfferStatus } from "@/lib/applicant-dashboard";
import { inspectionHavenStatusVariant } from "@/lib/inspection-lifecycle";

export function firstName(fullName?: string | null) {
  if (!fullName) return "there";
  return fullName.trim().split(/\s+/)[0] ?? "there";
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatInspectionWindow(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return `${new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(startDate)} - ${new Intl.DateTimeFormat("en-NG", {
    timeStyle: "short",
  }).format(endDate)}`;
}

export function inspectionTabFor(item: EnrichedInspection) {
  if (item.inspection.status === "CANCELLED" || item.inspection.status === "DECLINED") {
    return "cancelled" as const;
  }
  if (item.slot && new Date(item.slot.endsAt).getTime() < Date.now()) {
    return "past" as const;
  }
  return "upcoming" as const;
}

export function inspectionStatusVariant(status: EnrichedInspection["inspection"]["status"]) {
  return inspectionHavenStatusVariant(status);
}

export function offerStatusVariant(status: OfferStatus | "COUNTER_RECEIVED") {
  if (status === "ACCEPTED") return "success" as const;
  if (status === "PENDING") return "secondary" as const;
  if (status === "COUNTER_RECEIVED") return "warning" as const;
  if (status === "COUNTERED") return "warning" as const;
  return "outline" as const;
}

export function offerStatusLabel(status: OfferStatus | "COUNTER_RECEIVED") {
  switch (status) {
    case "COUNTER_RECEIVED":
      return "Counter Received";
    case "COUNTERED":
      return "Countered";
    case "DECLINED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return `${status[0]}${status.slice(1).toLowerCase()}`;
  }
}

export function notificationCategory(kind: NotificationKind) {
  if (kind.startsWith("INSPECTION")) return "inspections" as const;
  if (kind.startsWith("OFFER")) return "offers" as const;
  return "general" as const;
}

export function buildCalendarHref(item: EnrichedInspection) {
  if (!item.slot || !item.listing) return "#";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `DreamHomes inspection: ${item.listing.title}`,
    dates: `${toCalendarStamp(item.slot.startsAt)}/${toCalendarStamp(item.slot.endsAt)}`,
    details: `Inspection booked via DreamHomes for ${item.listing.title}.`,
    location: item.listing.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toCalendarStamp(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
