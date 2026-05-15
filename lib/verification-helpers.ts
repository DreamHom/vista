import type { VerificationResponse } from "@/lib/applicant-dashboard";

/** Newest verification row for a given type (Haven returns mixed order; `.find` alone is unsafe). */
export function latestVerificationByType(
  verifications: VerificationResponse[],
  type: VerificationResponse["type"],
): VerificationResponse | null {
  const matches = verifications.filter((item) => item.type === type);
  if (matches.length === 0) return null;
  matches.sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime());
  return matches[0] ?? null;
}

export function latestPropertyDocumentsVerification(
  verifications: VerificationResponse[],
  propertyId: number,
): VerificationResponse | null {
  const matches = verifications.filter(
    (item) => item.type === "PROPERTY_DOCUMENTS" && item.targetPropertyId === propertyId,
  );
  if (matches.length === 0) return null;
  matches.sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime());
  return matches[0] ?? null;
}
