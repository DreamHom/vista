import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import type { InspectionResponse } from "@/lib/applicant-dashboard";

export type InspectionHavenStatus = InspectionResponse["status"];

/** Haven enum → shared UI copy (all roles). */
export const INSPECTION_HAVEN_STATUS_LABEL: Record<InspectionHavenStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
  COMPLETED: "Completed",
};

export function inspectionHavenStatusLabel(status: InspectionHavenStatus): string {
  return INSPECTION_HAVEN_STATUS_LABEL[status] ?? status;
}

export function inspectionHavenStatusVariant(
  status: InspectionHavenStatus,
): "success" | "secondary" | "warning" | "outline" {
  if (status === "APPROVED" || status === "COMPLETED") return "success";
  if (status === "PENDING") return "secondary";
  if (status === "DECLINED") return "warning";
  return "outline";
}

/** Owner/agent local queue labels (aligned with Haven wording). */
export type WorkspaceInspectionStatusLabel =
  | "Pending"
  | "Approved"
  | "Completed"
  | "Cancelled"
  | "No-show";

export type WorkspaceInspectionLocalStatus =
  | "pending"
  | "approved"
  | "completed"
  | "cancelled"
  | "no_show";

const LEGACY_OWNER_LABELS = ["Confirmed"] as const;

export function normalizeWorkspaceInspectionLabel(
  label: string,
): WorkspaceInspectionStatusLabel {
  if (label === "Confirmed") return "Approved";
  if (
    label === "Pending" ||
    label === "Approved" ||
    label === "Completed" ||
    label === "Cancelled" ||
    label === "No-show"
  ) {
    return label;
  }
  return "Pending";
}

export function workspaceLabelToLocalStatus(
  label: WorkspaceInspectionStatusLabel,
): WorkspaceInspectionLocalStatus {
  switch (label) {
    case "Approved":
      return "approved";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    case "No-show":
      return "no_show";
    default:
      return "pending";
  }
}

export function workspaceLocalStatusVariant(
  local: WorkspaceInspectionLocalStatus,
): "success" | "secondary" | "warning" | "outline" {
  if (local === "approved" || local === "completed") return "success";
  if (local === "cancelled" || local === "no_show") return "outline";
  return "warning";
}

/** Migrates legacy localStorage values (Confirmed → Approved, confirmed → approved). */
export function migrateWorkspaceInspectionLabel(
  label: string,
): WorkspaceInspectionStatusLabel {
  return normalizeWorkspaceInspectionLabel(label);
}

export function isLegacyWorkspaceInspectionLabel(label: string): boolean {
  return (LEGACY_OWNER_LABELS as readonly string[]).includes(label);
}

export function canApplicantCancelInspection(status: InspectionHavenStatus): boolean {
  return status === "PENDING";
}

/** Shown on upcoming cards when cancel is not available. */
export function applicantCancelBlockedReason(status: InspectionHavenStatus): string | null {
  switch (status) {
    case "PENDING":
      return null;
    case "APPROVED":
      return "This visit is approved on Haven. Message the host if your plans change; they can decline or mark a no-show from their dashboard.";
    case "CANCELLED":
      return "You already cancelled this request. The slot may be open for others to book.";
    case "DECLINED":
      return "The host declined this request. Pick another time on the listing if slots are still open.";
    case "NO_SHOW":
      return "Recorded as a no-show. Contact the host if you need to visit again.";
    case "COMPLETED":
      return "This visit is complete. It appears under Past.";
    default:
      return "This booking cannot be cancelled from here.";
  }
}

/** Short line on cancelled-tab cards. */
export function applicantInspectionOutcomeLine(status: InspectionHavenStatus): string {
  switch (status) {
    case "CANCELLED":
      return "You cancelled this request. The time slot is freed for other applicants.";
    case "DECLINED":
      return "The host declined this request. You can rebook if new slots are published.";
    case "NO_SHOW":
      return "Marked as a no-show after the scheduled window.";
    default:
      return "This visit is no longer active.";
  }
}

export function inspectionCancelErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "This visit is no longer pending (already approved, declined, or cancelled). Refresh your list.";
    }
    if (error.status === 403) {
      return "Only the applicant who booked this slot can cancel it.";
    }
    if (error.status === 404) {
      return "This inspection request was not found. Refresh and try again.";
    }
    return apiErrorMessage(error, "We could not cancel this inspection.");
  }
  return apiErrorMessage(error, "We could not cancel this inspection.");
}

export function inspectionOwnerDeclineErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "This request is no longer pending on Haven. Refresh the queue.";
    }
    return apiErrorMessage(error, "Could not decline on the server.");
  }
  return apiErrorMessage(error, "Could not decline on the server.");
}

export function inspectionOwnerNoShowErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "A no-show cannot be recorded for this visit in its current state. Refresh and try again.";
    }
    return apiErrorMessage(error, "Could not record no-show on the server.");
  }
  return apiErrorMessage(error, "Could not record no-show on the server.");
}
