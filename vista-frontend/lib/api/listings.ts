import { havenFetch } from "./http";
import { getAllPageItems, normalizePage } from "./page";
import type {
  CreateListingRequest,
  ListingResponse,
  Page,
  PhotoResponse,
  UpdateListingRequest,
} from "./types";

export interface ListingsQuery {
  page?: number;
  size?: number;
  city?: string;
  area?: string;
  purpose?: "RENT" | "SALE";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  type?: string;
  verifiedOnly?: boolean;
}

export async function listListings(
  query: ListingsQuery = {},
): Promise<Page<ListingResponse>> {
  return havenFetch<Page<ListingResponse>>("/api/listings", {
    query: { ...query },
    revalidate: 30,
    tags: ["listings"],
  });
}

/** Backend contract has no `/api/listings/mine`; fetch public listings and filter. */
export async function listOwnedListings(
  ownerId: string,
  query: ListingsQuery = {},
): Promise<Page<ListingResponse>> {
  const page = await listListings({ ...query });
  const content = page.content.filter((listing) => String(listing.ownerId) === ownerId);
  return normalizePage<ListingResponse>({ ...page, content });
}

export async function listAllOwnedListings(
  ownerId: string,
  query: ListingsQuery = {},
): Promise<ListingResponse[]> {
  const pages = await getAllPageItems<ListingResponse>(
    (page, size) => listListings({ ...query, page, size }),
    100,
  );
  return pages.filter((listing) => String(listing.ownerId) === ownerId);
}

export async function getListing(id: string): Promise<ListingResponse> {
  return havenFetch<ListingResponse>(`/api/listings/${id}`, {
    revalidate: 30,
    tags: [`listing:${id}`],
  });
}

export async function getListingPhotos(
  listingId: string,
): Promise<PhotoResponse[]> {
  return havenFetch<PhotoResponse[]>(`/api/listings/${listingId}/photos`, {
    revalidate: 30,
    tags: [`listing:${listingId}:photos`],
  });
}

export async function createListing(
  token: string,
  body: CreateListingRequest,
): Promise<ListingResponse> {
  return havenFetch<ListingResponse>("/api/listings", {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function updateListing(
  token: string,
  id: string,
  body: UpdateListingRequest,
): Promise<ListingResponse> {
  return havenFetch<ListingResponse>(`/api/listings/${id}`, {
    method: "PATCH",
    token,
    body,
    cache: "no-store",
  });
}

export async function uploadListingPhoto(
  token: string,
  listingId: string,
  file: File,
  caption?: string,
): Promise<PhotoResponse> {
  const form = new FormData();
  form.append("file", file);
  if (caption) form.append("caption", caption);
  return havenFetch<PhotoResponse>(`/api/listings/${listingId}/photos`, {
    method: "POST",
    token,
    body: form,
    multipart: true,
    cache: "no-store",
  });
}

export async function deleteListingPhoto(
  token: string,
  photoId: string,
): Promise<void> {
  await havenFetch<void>(`/api/listings/photos/${photoId}`, {
    method: "DELETE",
    token,
    cache: "no-store",
  });
}
