import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { assignmentStatusLabel, assignmentStatusVariant, type AgentListingStatus } from "@/lib/assignment-lifecycle";

export function AssignmentStatusBadge({ status }: { status: AgentListingStatus }) {
  return <StatusBadge label={assignmentStatusLabel(status)} variant={assignmentStatusVariant(status)} />;
}
