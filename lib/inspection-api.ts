import { api } from "@/lib/api";
import type { InspectionResponse } from "@/lib/applicant-dashboard";

export function cancelInspectionWithReason(inspectionId: number, reason: string) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/cancel`, { reason: reason.trim() });
}

export function agentRescheduleInspection(inspectionId: number, slotId: number) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/agent/reschedule`, { slotId });
}

export function agentCompleteInspection(inspectionId: number) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/agent/complete`, {});
}

export function markInspectionNoShow(inspectionId: number) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/mark-no-show`, {});
}
