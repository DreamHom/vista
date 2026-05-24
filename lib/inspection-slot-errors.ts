import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";

function problemText(error: ApiError): string {
  return `${error.problem?.type ?? ""} ${error.problem?.detail ?? ""}`.toLowerCase();
}

/** POST /listings/{id}/slots → 409 when GIST exclude blocks overlapping windows. */
export function isSlotOverlapConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  const text = problemText(error);
  return (
    text.includes("overlap") ||
    text.includes("intersect") ||
    text.includes("time_range") ||
    text.includes("exclude") ||
    text.includes("slot")
  );
}

/** POST /inspections → 409 when another applicant claimed the same slot first. */
export function isSlotClaimConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  if (isSlotOverlapConflict(error)) return false;
  const text = problemText(error);
  return (
    text.includes("claim") ||
    text.includes("taken") ||
    text.includes("unavailable") ||
    text.includes("slot") ||
    text.includes("inspection")
  );
}

export function inspectionSlotCreateErrorMessage(
  error: unknown,
  fallback = "We couldn't create that inspection slot.",
): string {
  if (isSlotOverlapConflict(error)) {
    return apiErrorMessage(
      error,
      "This time overlaps another slot on this listing. Pick a non-overlapping window.",
    );
  }
  return apiErrorMessage(error, fallback);
}

export function inspectionSlotClaimErrorMessage(
  error: unknown,
  fallback = "We couldn't book this slot.",
): string {
  if (error instanceof ApiError && error.status === 409) {
    return apiErrorMessage(
      error,
      "Someone else just booked this time. Choose another slot.",
    );
  }
  return apiErrorMessage(error, fallback);
}
