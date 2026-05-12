import { havenFetch } from "./http";
import { normalizePage } from "./page";
import type { Page, ReportListingRequest, SavedListingResponse } from "./types";

export async function listMySaves(
  token: string,
  page = 0,
  size = 20,
): Promise<Page<SavedListingResponse>> {
  const raw = await havenFetch<unknown>("/api/saves/mine", {
    token,
    query: { page, size },
    cache: "no-store",
  });
  return normalizePage<SavedListingResponse>(raw);
}

export async function saveListing(
  token: string,
  listingId: string,
): Promise<void> {
  await havenFetch<void>(`/api/listings/${listingId}/save`, {
    method: "POST",
    token,
    cache: "no-store",
  });
}

export async function unsaveListing(
  token: string,
  listingId: string,
): Promise<void> {
  await havenFetch<void>(`/api/listings/${listingId}/save`, {
    method: "DELETE",
    token,
    cache: "no-store",
  });
}

export async function reportListing(
  token: string,
  listingId: string,
  body: ReportListingRequest,
): Promise<void> {
  await havenFetch<void>(`/api/listings/${listingId}/report`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}
