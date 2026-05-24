import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";

export function isListingStaleConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  const type = (error.problem?.type ?? "").toLowerCase();
  const detail = (error.problem?.detail ?? "").toLowerCase();
  return (
    type.includes("optimistic") ||
    type.includes("version") ||
    detail.includes("modified") ||
    detail.includes("reload") ||
    detail.includes("someone else")
  );
}

export function isListingStateConflict(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  return !isListingStaleConflict(error);
}

export function ownerListingErrorMessage(
  error: unknown,
  fallback = "We couldn't update that listing right now.",
): string {
  if (isListingStaleConflict(error)) {
    return apiErrorMessage(
      error,
      "This listing changed while you were editing. Refresh the page, then try again.",
    );
  }
  if (isListingStateConflict(error)) {
    return apiErrorMessage(
      error,
      "That status change isn't allowed for this listing. Refresh and check the current state.",
    );
  }
  return apiErrorMessage(error, fallback);
}
