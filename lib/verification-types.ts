export type AutomatedCheckStatus = "PASSED" | "FAILED" | "NEEDS_HUMAN_REVIEW";

export interface AutomatedCheckResultResponse {
  checkType: "OWNER_IDENTITY" | "AGENT_CREDENTIALS" | "APPLICANT_IDENTITY" | "PROPERTY_DOCUMENTS";
  providerName: string;
  status: AutomatedCheckStatus;
  score: number;
  extractedFields: string;
  providerReference: string;
  runAt: string;
}

export function parseExtractedFields(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function formatExtractedFieldKey(key: string): string {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
