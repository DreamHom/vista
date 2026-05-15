/** Image-like URLs for inline previews in admin verification UI. */
export const VERIFICATION_ATTACHMENT_IMAGE_PATTERN = /\.(png|jpe?g|webp|gif)(\?|#|$)/i;

export function isSafeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Accepts API string, already-parsed JSON, or empty. */
export function normalizeVerificationDocumentRefs(
  raw: string | Record<string, unknown> | null | undefined,
): unknown | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  const s = String(raw).trim();
  if (!s) return null;
  if (!(s.startsWith("{") && s.endsWith("}")) && !(s.startsWith("[") && s.endsWith("]"))) {
    return s;
  }
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return s;
  }
}
