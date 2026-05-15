import type { ListingSearchInput } from "@/lib/seed/public-data";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryState = Record<string, string | string[] | undefined>;

/** Next.js may pass a single key as `string | string[]` — normalize for listing search. */
function firstQueryParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Coerce App Router `searchParams` into the shape `searchListings` expects
 * (singleton strings, never raw arrays).
 */
export function normalizeListingSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ListingSearchInput {
  return {
    q: firstQueryParam(raw.q),
    location: firstQueryParam(raw.location),
    listingType: firstQueryParam(raw.listingType),
    propertyType: firstQueryParam(raw.propertyType),
    bedrooms: firstQueryParam(raw.bedrooms),
    bathrooms: firstQueryParam(raw.bathrooms),
    priceMin: firstQueryParam(raw.priceMin),
    priceMax: firstQueryParam(raw.priceMax),
    verified: firstQueryParam(raw.verified),
    availability: firstQueryParam(raw.availability),
    sort: firstQueryParam(raw.sort),
    page: firstQueryParam(raw.page),
  };
}

/** Build `/listings` URLs with typed filters (omits empty values). */
export function buildListingsBrowseHref(filters: Partial<ListingSearchInput>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

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
