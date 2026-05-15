/**
 * Helpers for Next.js `metadata` / Open Graph fields (search + social previews).
 */

const META_DESC_MAX = 155;

export function truncateMetaDescription(text: string, max = META_DESC_MAX): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const cut = normalized.slice(0, max - 1).trimEnd();
  return cut.endsWith("…") ? cut : `${cut}…`;
}
