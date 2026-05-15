import { isPlainObject } from "./display-name";

/** Mirrors haven’s `Page<T>` / Spring `Page` JSON shape. */
export interface HavenPageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface HavenPage<T> {
  content: T[];
  page: HavenPageMeta;
}

/** Empty page for safe defaults before data loads. */
export const emptyHavenPage = <T>(): HavenPage<T> => ({
  content: [],
  page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
});

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Safe parse of a haven page payload; returns an empty page when shape is wrong. */
export function normalizeHavenPage<T>(raw: unknown): HavenPage<T> {
  if (isPlainObject(raw) && Array.isArray(raw.content) && isPlainObject(raw.page)) {
    const page = raw.page as Record<string, unknown>;
    return {
      content: raw.content as T[],
      page: {
        size: asNumber(page.size),
        number: asNumber(page.number),
        totalElements: asNumber(page.totalElements),
        totalPages: asNumber(page.totalPages),
      },
    };
  }

  return {
    content: [],
    page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
  };
}

/** Fetch every page item (bounded by backend) for admin-style exports or sync. */
export async function getAllHavenPageItems<T>(
  fetchPage: (page: number, size: number) => Promise<unknown>,
  size = 100,
): Promise<T[]> {
  const first = normalizeHavenPage<T>(await fetchPage(0, size));
  const items = [...first.content];

  for (let page = 1; page < first.page.totalPages; page += 1) {
    const next = normalizeHavenPage<T>(await fetchPage(page, size));
    items.push(...next.content);
  }

  return items;
}
