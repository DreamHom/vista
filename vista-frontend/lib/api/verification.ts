import { havenFetch } from "./http";
import { isPlainObject } from "./display-name-from-record";
import { normalizePage } from "./page";
import type {
  RejectVerificationRequest,
  SubmitVerificationRequest,
  VerificationTrack,
  VerificationResponse,
} from "./types";

export async function submitVerification(
  token: string,
  body: SubmitVerificationRequest,
): Promise<VerificationResponse> {
  return havenFetch<VerificationResponse>("/api/verifications", {
    method: "POST",
    token,
    body: {
      type: body.track,
      propertyId: body.listingId,
      documentRefs: Object.fromEntries(
        body.documentUrls.map((url, index) => [
          `document_${index + 1}`,
          { uploadedUrl: url },
        ]),
      ),
      note: body.note,
    },
    cache: "no-store",
  });
}

export async function adminListVerifications(
  token: string,
  type: VerificationTrack,
  page = 0,
  size = 20,
): Promise<VerificationResponse[]> {
  const raw = await havenFetch<unknown>("/api/admin/verifications", {
    token,
    query: { type, page, size },
    cache: "no-store",
  });
  return normalizePage<unknown>(raw).content.map(normalizeVerificationResponse);
}

export async function adminApproveVerification(
  token: string,
  id: string,
): Promise<VerificationResponse> {
  const raw = await havenFetch<unknown>(
    `/api/admin/verifications/${id}/approve`,
    {
      method: "POST",
      token,
      cache: "no-store",
    },
  );
  return normalizeVerificationResponse(raw);
}

export async function adminRejectVerification(
  token: string,
  id: string,
  body: RejectVerificationRequest,
): Promise<VerificationResponse> {
  const raw = await havenFetch<unknown>(
    `/api/admin/verifications/${id}/reject`,
    {
      method: "POST",
      token,
      body,
      cache: "no-store",
    },
  );
  return normalizeVerificationResponse(raw);
}

function normalizeVerificationResponse(raw: unknown): VerificationResponse {
  if (!isPlainObject(raw)) {
    return {
      id: "",
      track: "OWNER_IDENTITY",
      status: "PENDING",
      submittedBy: "",
      documents: [],
      submittedAt: new Date(0).toISOString(),
    };
  }

  const track = asTrack(raw.track ?? raw.type);
  const documents = normalizeVerificationDocuments(raw.documents, raw.documentRefs);

  return {
    id: asId(raw.id),
    track,
    status: asStatus(raw.status),
    submittedBy:
      asString(raw.submittedBy) ||
      asId(raw.submittedByUserId ?? raw.userId ?? raw.submitterId),
    submittedByName:
      asOptionalString(raw.submittedByName) ||
      asOptionalString(raw.submitterName) ||
      asOptionalString(raw.userDisplayName),
    subject:
      asOptionalString(raw.subject) ||
      asOptionalString(raw.displayName) ||
      asOptionalString(raw.fullName),
    documents,
    submittedAt:
      asOptionalString(raw.submittedAt) ||
      asOptionalString(raw.createdAt) ||
      new Date(0).toISOString(),
    decidedAt:
      asOptionalString(raw.decidedAt) ||
      asOptionalString(raw.reviewedAt) ||
      asOptionalString(raw.updatedAt),
    decisionNote:
      asOptionalString(raw.decisionNote) ||
      asOptionalString(raw.reason) ||
      asOptionalString(raw.note),
  };
}

function normalizeVerificationDocuments(
  documentsRaw: unknown,
  documentRefsRaw: unknown,
): VerificationResponse["documents"] {
  if (Array.isArray(documentsRaw)) {
    return documentsRaw
      .map((entry, index) => normalizeDocumentEntry(entry, index))
      .filter((entry) => !!entry);
  }

  if (isPlainObject(documentRefsRaw)) {
    return Object.entries(documentRefsRaw).map(([key, value], index) => {
      if (isPlainObject(value)) {
        const name =
          asOptionalString(value.name) ||
          asOptionalString(value.kind) ||
          humanizeDocumentKey(key) ||
          `Document ${index + 1}`;
        return {
          name,
          url:
            asOptionalString(value.uploadedUrl) ||
            asOptionalString(value.url) ||
            undefined,
        };
      }

      return {
        name: humanizeDocumentKey(key) || `Document ${index + 1}`,
        url: asOptionalString(value) || undefined,
      };
    });
  }

  return [];
}

function normalizeDocumentEntry(
  entry: unknown,
  index: number,
): VerificationResponse["documents"][number] | null {
  if (typeof entry === "string") {
    return { name: `Document ${index + 1}`, url: entry };
  }

  if (!isPlainObject(entry)) return null;

  return {
    name:
      asOptionalString(entry.name) ||
      asOptionalString(entry.kind) ||
      `Document ${index + 1}`,
    url:
      asOptionalString(entry.url) ||
      asOptionalString(entry.uploadedUrl) ||
      undefined,
  };
}

function asTrack(value: unknown): VerificationTrack {
  switch (value) {
    case "AGENT_CREDENTIALS":
    case "PROPERTY_DOCUMENTS":
    case "APPLICANT_IDENTITY":
    case "OWNER_IDENTITY":
      return value;
    default:
      return "OWNER_IDENTITY";
  }
}

function asStatus(value: unknown): VerificationResponse["status"] {
  switch (value) {
    case "APPROVED":
    case "REJECTED":
    case "PENDING":
      return value;
    default:
      return "PENDING";
  }
}

function asId(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}`;
  return "";
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}`;
  return "";
}

function asOptionalString(value: unknown): string | undefined {
  const normalized = asString(value).trim();
  return normalized || undefined;
}

function humanizeDocumentKey(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
