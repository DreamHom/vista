import { isPlainObject } from "./display-name-from-record";
import type { Page } from "./types";

export function normalizePage<T>(raw: unknown): Page<T> {
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

export async function getAllPageItems<T>(
  fetchPage: (page: number, size: number) => Promise<Page<T>>,
  size = 100,
): Promise<T[]> {
  const first = normalizePage<T>(await fetchPage(0, size));
  const items = [...first.content];

  for (let page = 1; page < first.page.totalPages; page += 1) {
    const next = normalizePage<T>(await fetchPage(page, size));
    items.push(...next.content);
  }

  return items;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
