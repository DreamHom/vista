export type QueryValue = string | number | boolean | null | undefined;
export type QueryState = Record<string, string | string[] | undefined>;

export function buildQueryString(
  current: QueryState,
  updates: Record<string, QueryValue | QueryValue[]>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) params.append(key, entry);
      });
      continue;
    }
    if (value) params.set(key, value);
  }

  for (const [key, value] of Object.entries(updates)) {
    params.delete(key);

    if (Array.isArray(value)) {
      value
        .filter((entry) => entry !== undefined && entry !== null && entry !== "")
        .forEach((entry) => params.append(key, String(entry)));
      continue;
    }

    if (value === undefined || value === null || value === "" || value === false) continue;
    params.set(key, String(value));
  }

  return params.toString();
}
