import type { NotificationKind, NotificationResponse } from "@/lib/applicant-dashboard";

function parsePayload(notification: NotificationResponse): Record<string, unknown> | null {
  const raw = notification.payload;
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return raw as Record<string, unknown>;
}

function inspectionIdFromPayload(payload: Record<string, unknown> | null): number | null {
  const id = payload?.inspectionRequestId;
  return typeof id === "number" ? id : null;
}

export function notificationDisplayCopy(notification: NotificationResponse): {
  title: string;
  body: string;
} {
  const payload = parsePayload(notification);
  const reason = typeof payload?.reason === "string" ? payload.reason.trim() : "";

  switch (notification.kind as NotificationKind | string) {
    case "INSPECTION_REQUESTED":
      return {
        title: "New inspection request",
        body: "A new applicant wants to view your listing.",
      };
    case "INSPECTION_APPROVED":
      return {
        title: "Your inspection is confirmed",
        body: "The owner approved your booking. See you on inspection day.",
      };
    case "INSPECTION_DECLINED":
      return {
        title: "Inspection declined",
        body: reason
          ? `The owner declined: "${reason}"`
          : "The owner declined this inspection.",
      };
    case "INSPECTION_CANCELLED": {
      const cancelledBy = typeof payload?.cancelledByUserId === "number" ? payload.cancelledByUserId : null;
      const applicantId = typeof payload?.applicantId === "number" ? payload.applicantId : null;
      const ownerId = typeof payload?.ownerId === "number" ? payload.ownerId : null;
      const agentId = typeof payload?.agentUserId === "number" ? payload.agentUserId : null;
      let party = "Someone";
      if (cancelledBy != null) {
        if (cancelledBy === applicantId) party = "Applicant";
        else if (cancelledBy === ownerId) party = "Owner";
        else if (cancelledBy === agentId) party = "Agent";
      }
      return {
        title: "Inspection cancelled",
        body: reason ? `Cancelled by ${party}: "${reason}"` : `Cancelled by ${party}.`,
      };
    }
    default:
      return {
        title: notification.kind.replaceAll("_", " "),
        body: notification.body?.trim() || "",
      };
  }
}

export function notificationInspectionDeepLink(notification: NotificationResponse): string | null {
  const payload = parsePayload(notification);
  const inspectionId = inspectionIdFromPayload(payload);
  if (inspectionId == null) return null;
  return `/dashboard/inspections?inspectionId=${inspectionId}`;
}
