import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import type { AgentListingResponse } from "@/lib/owner-dashboard";

export type AgentListingStatus = AgentListingResponse["status"];

export function assignmentStatusLabel(status: AgentListingStatus): string {
  switch (status) {
    case "REQUESTED":
      return "Invite sent";
    case "ACCEPTED":
      return "Active";
    case "DECLINED":
      return "Declined";
    case "REVOKED":
      return "Revoked";
    default:
      return status;
  }
}

export function assignmentStatusVariant(
  status: AgentListingStatus,
): "success" | "warning" | "secondary" | "outline" {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "REQUESTED":
      return "warning";
    case "DECLINED":
    case "REVOKED":
      return "outline";
    default:
      return "secondary";
  }
}

export function isTerminalAssignmentStatus(status: AgentListingStatus): boolean {
  return status === "DECLINED" || status === "REVOKED";
}

export function agentCanRespondToInvite(status: AgentListingStatus): boolean {
  return status === "REQUESTED";
}

/** Haven `POST /agent-listings/{id}/revoke` — owner (or admin); only `ACCEPTED` rows. */
export function ownerCanRevokeAssignment(status: AgentListingStatus): boolean {
  return status === "ACCEPTED";
}

export function assignmentStatusHint(status: AgentListingStatus): string | null {
  switch (status) {
    case "REQUESTED":
      return "Waiting for the agent to accept or decline. To invite someone else later, wait for this invite to finish or start a new row after it is declined or revoked.";
    case "ACCEPTED":
      return "This agent can act on the listing (slots, inspections, offers) alongside you.";
    case "DECLINED":
      return "Terminal — invite a different agent with a new assignment if you still want help.";
    case "REVOKED":
      return "Terminal — management ended. Invite again to create a fresh assignment row.";
    default:
      return null;
  }
}

export function assignmentErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return apiErrorMessage(
        error,
        "That assignment has already moved to another state. Refresh and try again.",
      );
    }
    if (error.status === 403) {
      return apiErrorMessage(error, "You are not allowed to change this assignment.");
    }
  }
  return apiErrorMessage(error, fallback);
}
