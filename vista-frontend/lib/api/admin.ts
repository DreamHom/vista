import { havenFetch } from "./http";
import { isPlainObject } from "./display-name-from-record";
import type {
  AdminAnalyticsSummary,
  ListingResponse,
  SuspendUserRequest,
  TakedownListingRequest,
} from "./types";

export async function adminApproveListing(
  token: string,
  id: string,
): Promise<ListingResponse> {
  return havenFetch<ListingResponse>(`/api/admin/listings/${id}/approve`, {
    method: "POST",
    token,
    cache: "no-store",
  });
}

export async function adminTakedownListing(
  token: string,
  id: string,
  body: TakedownListingRequest,
): Promise<ListingResponse> {
  return havenFetch<ListingResponse>(`/api/admin/listings/${id}/takedown`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function adminSuspendUser(
  token: string,
  id: string,
  body: SuspendUserRequest,
): Promise<void> {
  await havenFetch<void>(`/api/admin/users/${id}/suspend`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function adminReactivateUser(
  token: string,
  id: string,
): Promise<void> {
  await havenFetch<void>(`/api/admin/users/${id}/reactivate`, {
    method: "POST",
    token,
    cache: "no-store",
  });
}

export async function adminAnalyticsSummary(
  token: string,
): Promise<AdminAnalyticsSummary> {
  const raw = await havenFetch<unknown>("/api/admin/analytics/summary", {
    token,
    cache: "no-store",
  });
  return normalizeAdminAnalyticsSummary(raw);
}

function normalizeAdminAnalyticsSummary(raw: unknown): AdminAnalyticsSummary {
  if (!isPlainObject(raw)) {
    return emptyAdminAnalyticsSummary();
  }

  const funnelRaw = isPlainObject(raw.funnel)
    ? raw.funnel
    : isPlainObject(raw.funnelSummary)
      ? raw.funnelSummary
      : {};

  const topAreasRaw = Array.isArray(raw.topAreas)
    ? raw.topAreas
    : Array.isArray(raw.top_areas)
      ? raw.top_areas
      : [];

  return {
    activeUsers30d: asNumber(raw.activeUsers30d ?? raw.active_users_30d),
    newListings30d: asNumber(raw.newListings30d ?? raw.new_listings_30d),
    inspectionsCompleted30d: asNumber(
      raw.inspectionsCompleted30d ?? raw.inspections_completed_30d,
    ),
    closedDeals30d: asNumber(raw.closedDeals30d ?? raw.closed_deals_30d),
    funnel: {
      saved: asNumber(funnelRaw.saved),
      inspectionRequested: asNumber(
        funnelRaw.inspectionRequested ?? funnelRaw.inspection_requested,
      ),
      offerSubmitted: asNumber(
        funnelRaw.offerSubmitted ?? funnelRaw.offer_submitted,
      ),
      closed: asNumber(funnelRaw.closed),
    },
    topAreas: topAreasRaw
      .map((entry) => normalizeTopArea(entry))
      .filter((entry) => entry !== null),
  };
}

function normalizeTopArea(
  raw: unknown,
): AdminAnalyticsSummary["topAreas"][number] | null {
  if (!isPlainObject(raw)) return null;

  return {
    area: asString(raw.area),
    demandScore: asNumber(raw.demandScore ?? raw.demand_score),
  };
}

function emptyAdminAnalyticsSummary(): AdminAnalyticsSummary {
  return {
    activeUsers30d: 0,
    newListings30d: 0,
    inspectionsCompleted30d: 0,
    closedDeals30d: 0,
    funnel: {
      saved: 0,
      inspectionRequested: 0,
      offerSubmitted: 0,
      closed: 0,
    },
    topAreas: [],
  };
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
