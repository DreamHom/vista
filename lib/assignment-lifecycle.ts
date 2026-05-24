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

export type ListingAssignmentBlockers = {
  pending: AgentListingResponse | null;
  active: AgentListingResponse | null;
};

/** At most one REQUESTED and one ACCEPTED row per listing (Haven partial unique indexes). */
export function getListingAssignmentBlockers(assignments: AgentListingResponse[]): ListingAssignmentBlockers {
  return {
    pending: assignments.find((row) => row.status === "REQUESTED") ?? null,
    active: assignments.find((row) => row.status === "ACCEPTED") ?? null,
  };
}

export function ownerCanInviteAgent(blockers: ListingAssignmentBlockers): boolean {
  return !blockers.pending && !blockers.active;
}

export function assignmentInviteBlockedMessage(blockers: ListingAssignmentBlockers): string | null {
  if (blockers.active) {
    return "This listing already has an active agent. Revoke that assignment (with a reason) before inviting someone else.";
  }
  if (blockers.pending) {
    return "You already have a pending invite on this listing. Withdraw it before inviting another agent.";
  }
  return null;
}

/** Owner ends a non-terminal row before inviting again (`POST /agent-listings/{id}/revoke`). */
export function ownerCanRevokeAssignment(status: AgentListingStatus): boolean {
  return status === "REQUESTED" || status === "ACCEPTED";
}

export function assignmentEndActionCopy(status: AgentListingStatus): {
  menuLabel: string;
  menuDescription: string;
  dialogTitle: string;
  dialogDescription: string;
  confirmLabel: string;
  pendingLabel: string;
  successToast: string;
} {
  if (status === "REQUESTED") {
    return {
      menuLabel: "Withdraw invite",
      menuDescription: "Ends the pending request so you can invite a different agent.",
      dialogTitle: "Withdraw invite",
      dialogDescription:
        "Only one pending invite is allowed per listing. Withdrawing clears the slot so you can invite someone else.",
      confirmLabel: "Withdraw invite",
      pendingLabel: "Withdrawing…",
      successToast: "Invite withdrawn. You can invite another agent now.",
    };
  }
  return {
    menuLabel: "Revoke assignment",
    menuDescription: "Agent loses listing access immediately. Invite someone new afterward.",
    dialogTitle: `End assignment`,
    dialogDescription:
      "Only one active agent is allowed per listing. Revoking ends this relationship; a reason is required for the audit trail.",
    confirmLabel: "Revoke assignment",
    pendingLabel: "Revoking…",
    successToast: "Assignment revoked. You can invite another agent now.",
  };
}

export function assignmentStatusHint(status: AgentListingStatus): string | null {
  switch (status) {
    case "REQUESTED":
      return "One pending invite per listing. Withdraw this invite before inviting a different agent.";
    case "ACCEPTED":
      return "One active agent per listing. Revoke this assignment before inviting someone else.";
    case "DECLINED":
      return "Terminal — you can invite a different agent with a new assignment row.";
    case "REVOKED":
      return "Terminal — invite again to start a fresh assignment row.";
    default:
      return null;
  }
}

export function assignmentInviteErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 409) {
    const detail = apiErrorMessage(error, "").toLowerCase();
    if (detail.includes("accepted") || detail.includes("active")) {
      return "This listing already has an active agent. Revoke that assignment first, then invite someone new.";
    }
    if (detail.includes("requested") || detail.includes("pending") || detail.includes("invite")) {
      return "You already have a pending invite on this listing. Withdraw it before inviting another agent.";
    }
    return apiErrorMessage(
      error,
      "Another assignment is already open on this listing. Refresh the page, end it, then try again.",
    );
  }
  return assignmentErrorMessage(error, fallback);
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
