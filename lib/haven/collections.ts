import { isPlainObject } from "./display-name";

/** Normalize Spring-style or loose JSON envelopes to a flat array. */
export function normalizeCollection<T>(raw: unknown, candidateKeys: readonly string[] = []): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (!isPlainObject(raw)) return [];

  const keys = [...candidateKeys, "content", "items", "results", "rows", "data"];

  for (const key of keys) {
    const value = raw[key];
    if (Array.isArray(value)) return value as T[];
  }

  return [];
}

/** Read total / count fields from paged envelopes or simple count objects. */
export function normalizeCount(raw: unknown, candidateKeys: readonly string[] = []): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (!isPlainObject(raw)) return 0;

  const keys = [...candidateKeys, "count", "unreadCount", "unread_count", "total", "totalCount", "total_count"];

  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return 0;
}
