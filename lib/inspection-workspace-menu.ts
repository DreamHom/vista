import type { InspectionResponse, SlotResponse } from "@/lib/applicant-dashboard";
import type { InspectionMoreMenuItem } from "@/components/inspection/inspection-more-menu";
import { isAfterInstant } from "@/lib/inspection-time-gates";

export type WorkspaceInspectionRole = "owner" | "agent" | "applicant";

export function buildApprovedInspectionMenuItems(input: {
  role: WorkspaceInspectionRole;
  status: InspectionResponse["status"];
  slot: SlotResponse | null;
  onCancel: () => void;
  onReschedule: () => void;
  onComplete: () => void;
  onNoShow: () => void;
}): InspectionMoreMenuItem[] {
  const { role, status, slot, onCancel, onReschedule, onComplete, onNoShow } = input;
  if (status !== "APPROVED" && status !== "PENDING") return [];

  const items: InspectionMoreMenuItem[] = [];
  const afterStart = isAfterInstant(slot?.startsAt);
  const afterEnd = isAfterInstant(slot?.endsAt);

  if (status === "PENDING" || status === "APPROVED") {
    if (role === "owner" || role === "agent" || role === "applicant") {
      items.push({
        id: "cancel",
        label: "Cancel inspection",
        description: "Requires a short reason. The other party is notified.",
        destructive: true,
        onSelect: onCancel,
      });
    }
  }

  if (status !== "APPROVED") return items;

  if (role === "agent") {
    items.push({
      id: "reschedule",
      label: "Reschedule to another slot",
      description: "Move this booking to an open slot on the same listing.",
      onSelect: onReschedule,
    });
    if (afterEnd) {
      items.push({
        id: "complete",
        label: "Mark completed",
        description: "Close the booking after the visit window ended.",
        onSelect: onComplete,
      });
    }
  }

  if ((role === "owner" || role === "agent") && afterStart) {
    items.push({
      id: "no-show",
      label: "Mark no-show",
      description: "Record that the applicant did not attend after the slot started.",
      destructive: true,
      onSelect: onNoShow,
    });
  }

  return items;
}
