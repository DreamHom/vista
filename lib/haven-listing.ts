import { api } from "@/lib/api";

const DEFAULT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.DREAMHOMES_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api";

const SERVER_UA = "dreamhomes-vista/1.0 (+https://www.dreamhomes.today)";

/** Raw listing row from Haven — shape grows with the authenticated principal. */
export interface HavenListingResponse {
  id: number;
  propertyId: number;
  ownerId: number;
  listingType: "RENT" | "SALE";
  askingPrice: number;
  currency: string;
  cautionFee: number | null;
  serviceCharge: number | null;
  agencyFee: number | null;
  title: string | null;
  description: string | null;
  headline: string | null;
  handoverDate: string | null;
  status: "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN";
  approvedAt: string | null;
  viewCount: number | null;
  createdAt: string;
  updatedAt: string;
  ownerIdentityVerifiedAt?: string | null;
  property: {
    id: number;
    type: string;
    address: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sizeSqm: number | null;
    documentsVerifiedAt: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  assignedAgentId: number | null;
  pendingReportCount?: number | null;
  petsAllowed?: string | null;
  utilitiesNote?: string | null;
  virtualTourUrl?: string | null;
  priceNegotiable?: boolean | null;
  floorPlanUrl?: string | null;
  ownerPublicBio?: string | null;
  /** Applicant personalization when JWT present. */
  savedByMe?: boolean | null;
  /** Owner-only — required for optimistic PATCH. */
  version?: number | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  pendingOfferCount?: number | null;
}

export interface ListingViewerContext {
  isOwner: boolean;
  isAssignedAgent: boolean;
  savedByMe: boolean;
  pendingOfferCount: number | null;
  version: number | null;
}

export function resolveListingViewerContext(
  listing: HavenListingResponse,
  viewer?: { userId?: number; role?: string } | null,
): ListingViewerContext {
  const userId = viewer?.userId;
  const isOwner = userId != null && userId === listing.ownerId;
  const isAssignedAgent =
    userId != null && listing.assignedAgentId != null && userId === listing.assignedAgentId;

  return {
    isOwner,
    isAssignedAgent,
    savedByMe: Boolean(listing.savedByMe),
    pendingOfferCount:
      isOwner && typeof listing.pendingOfferCount === "number" ? listing.pendingOfferCount : null,
    version: isOwner && typeof listing.version === "number" ? listing.version : null,
  };
}

async function publicListingFetch<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${DEFAULT_PUBLIC_API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": SERVER_UA },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Public API request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/**
 * Single Haven URL (`GET /listings/{id}`) — anonymous baseline on the server,
 * JWT-enriched fields in the browser when a session exists.
 */
export async function fetchHavenListing(
  id: string | number,
  options?: { skipAuth?: boolean },
): Promise<HavenListingResponse> {
  const path = `/listings/${id}`;
  if (typeof window !== "undefined" && !options?.skipAuth) {
    return api.get<HavenListingResponse>(path);
  }
  return publicListingFetch<HavenListingResponse>(path);
}
