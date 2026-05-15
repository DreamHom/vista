import { getListingCoordinates } from "@/lib/seed/listing-map-points";

const DEFAULT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.DREAMHOMES_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api";

export type AvailabilityKey = "NOW" | "THIRTY_DAYS" | "NEXT_QUARTER";
export type AgentSort = "highest-rated" | "most-deals" | "newest" | "most-active";
export type ListingSort = "newest" | "price-asc" | "price-desc" | "most-saved";

export interface ListingSearchInput {
  q?: string;
  location?: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  priceMin?: string;
  priceMax?: string;
  verified?: string;
  availability?: string;
  sort?: string;
  page?: string;
}

export interface AgentSearchInput {
  q?: string;
  location?: string;
  specialization?: string;
  minRating?: string;
  verified?: string;
  feeMax?: string;
  sort?: string;
  page?: string;
}

interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface PagedModel<T> {
  content: T[];
  page: PageMetadata;
}

interface PropertySummary {
  id: number;
  type:
    | "APARTMENT"
    | "HOUSE"
    | "LAND"
    | "COMMERCIAL"
    | "SELF_CONTAIN"
    | "MINI_FLAT"
    | "STUDIO"
    | "ROOM_AND_PARLOUR";
  address: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  documentsVerifiedAt: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface ListingResponse {
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
  property: PropertySummary;
  assignedAgentId: number | null;
  pendingReportCount: number | null;
  petsAllowed?: string | null;
  utilitiesNote?: string | null;
  virtualTourUrl?: string | null;
  priceNegotiable?: boolean | null;
  floorPlanUrl?: string | null;
  ownerPublicBio?: string | null;
}

interface PhotoResponse {
  id: number;
  listingId: number;
  url: string;
  displayOrder: number;
  caption: string | null;
  uploadedAt: string;
}

interface CommentResponse {
  id: number;
  listingId: number;
  authorUserId: number;
  body: string;
  createdAt: string;
}

interface ReviewResponse {
  id: number;
  listingId: number;
  reviewerUserId: number;
  revieweeUserId: number;
  rating: number;
  body: string;
  createdAt: string;
}

interface SlotResponse {
  id: number;
  listingId: number;
  startsAt: string;
  endsAt: string;
}

interface PublicUserProfileApi {
  id: number;
  fullName: string;
  displayName?: string | null;
  role: "OWNER" | "AGENT" | "APPLICANT" | "ADMIN";
  identityVerifiedAt: string | null;
  agentCredentialVerifiedAt: string | null;
  suspended: boolean;
  averageRating: number | null;
  reviewCount: number;
  closedDealCount: number | null;
  medianResponseMinutes: number | null;
  joinedAt: string | null;
  publicBio?: string | null;
}

export interface PublicPhoto {
  id: string;
  url: string;
  alt: string;
}

export interface PublicPerson {
  id: string;
  name: string;
  /** When the directory shows a display name, this is the legal full name from the server (if different). */
  legalName?: string | null;
  role: "OWNER" | "AGENT" | "APPLICANT" | "ADMIN";
  verified: boolean;
  averageRating: number | null;
  reviewCount: number;
  closedDealCount: number | null;
  medianResponseMinutes: number | null;
  joinedAt: string | null;
  identityVerifiedAt?: string | null;
  agentCredentialVerifiedAt?: string | null;
  /** From Haven `publicBio` on owner public profile when present. */
  publicBio?: string | null;
  /** Avatar URL when the API surfaces one; UI falls back to seeded pastel. */
  profileImageUrl?: string | null;
}

export type PublicOwner = PublicPerson;

export type PublicAgent = PublicPerson;

export interface ListingCommentReply {
  id: string;
  authorName: string;
  authorRole: "Owner" | "Agent";
  body: string;
  date: string;
}

export interface ListingComment {
  id: string;
  authorName: string;
  authorRole: "Applicant" | "Owner" | "Agent";
  body: string;
  date: string;
  replies: ListingCommentReply[];
}

export interface PublicReview {
  id: string;
  reviewerName: string;
  reviewerRole: "Owner" | "Agent" | "Applicant";
  rating: number;
  body: string;
  date: string;
  listingId: string;
}

export interface ListingSlot {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface PublicListing {
  id: string;
  ownerId: string;
  agentId: string | null;
  title: string;
  headline: string | null;
  type: PropertySummary["type"];
  term: "RENT" | "SALE";
  location: string;
  address: string;
  priceNgn: number;
  cautionFeeNgn: number | null;
  serviceChargeNgn: number | null;
  agencyFeeNgn: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  description: string;
  status: ListingResponse["status"];
  handoverDate: string | null;
  availableFrom: string;
  availability: AvailabilityKey;
  viewCount: number;
  pendingReportCount: number;
  publishedAt: string;
  updatedAt: string;
  verified: boolean;
  verificationLabel: string;
  photos: PublicPhoto[];
  owner: PublicOwner;
  agent: PublicAgent | null;
  comments: ListingComment[];
  slots: ListingSlot[];
  mapArea: string;
  /** WGS-84 when Haven supplies coordinates; else seeded approximate pin. */
  latitude: number;
  longitude: number;
  petsAllowed?: string | null;
  utilitiesNote?: string | null;
  virtualTourUrl?: string | null;
  priceNegotiable?: boolean;
  ownerPublicBio?: string | null;
}

export interface PublicListingDetail extends PublicListing {
  reviews: PublicReview[];
}

export interface ListingsResult {
  listings: PublicListing[];
  total: number;
  totalPages: number;
  page: number;
  sort: ListingSort;
  q?: string;
  backendUnavailable: boolean;
}

const profileCache = new Map<string, Promise<PublicUserProfileApi | null>>();
const listingCache = new Map<string, Promise<PublicListingDetail | null>>();

function makeUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>) {
  const url = new URL(path.startsWith("http") ? path : `${DEFAULT_PUBLIC_API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function publicFetch<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const response = await fetch(makeUrl(path, query), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Public API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function numeric(value?: string) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function formatDate(date: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!date) return "Not disclosed";
  return new Intl.DateTimeFormat("en-NG", options ?? { dateStyle: "medium" }).format(new Date(date));
}

function shortLocation(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.slice(-2).join(", ");
  return address;
}

function humanizePropertyType(type: PropertySummary["type"]) {
  if (type === "SELF_CONTAIN") return "self contain";
  if (type === "MINI_FLAT") return "mini flat";
  if (type === "ROOM_AND_PARLOUR") return "room and parlour";
  return type.toLowerCase().replaceAll("_", " ");
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fallbackTitle(listing: ListingResponse) {
  const beds = listing.property.bedrooms ? `${listing.property.bedrooms}-bedroom ` : "";
  const type = humanizePropertyType(listing.property.type);
  return sentenceCase(`${beds}${type} in ${shortLocation(listing.property.address)}`);
}

function fallbackHeadline(listing: ListingResponse) {
  return `${listing.listingType === "RENT" ? "Rent" : "Sale"} opportunity in ${shortLocation(
    listing.property.address,
  )}`;
}

function fallbackDescription(listing: ListingResponse) {
  const facts = [
    listing.property.bedrooms ? `${listing.property.bedrooms} bedroom` : undefined,
    listing.property.bathrooms ? `${listing.property.bathrooms} bathroom` : undefined,
    listing.property.sizeSqm ? `${listing.property.sizeSqm} sqm` : undefined,
    humanizePropertyType(listing.property.type),
  ].filter(Boolean);

  return `${sentenceCase(facts.join(", "))} at ${listing.property.address}. Haven has not published a fuller marketing description for this listing yet.`;
}

function toAvailability(handoverDate: string | null): AvailabilityKey {
  if (!handoverDate) return "NOW";
  const now = new Date();
  const then = new Date(handoverDate);
  const diffDays = Math.ceil((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return "THIRTY_DAYS";
  return "NEXT_QUARTER";
}

export function formatAvailability(key: AvailabilityKey) {
  if (key === "NOW") return "Available now";
  if (key === "THIRTY_DAYS") return "Within 30 days";
  return "Next quarter";
}

function availabilityText(handoverDate: string | null) {
  if (!handoverDate) return "Available now";
  return `Available from ${formatDate(handoverDate, { dateStyle: "long" })}`;
}

function toPublicPerson(profile: PublicUserProfileApi): PublicPerson {
  const display = profile.displayName?.trim() || profile.fullName;
  const legal = profile.fullName.trim() !== display.trim() ? profile.fullName : null;
  return {
    id: String(profile.id),
    name: display,
    legalName: legal,
    role: profile.role,
    verified:
      Boolean(profile.identityVerifiedAt) ||
      (profile.role === "AGENT" && Boolean(profile.agentCredentialVerifiedAt)),
    averageRating: profile.averageRating,
    reviewCount: profile.reviewCount,
    closedDealCount: profile.closedDealCount,
    medianResponseMinutes: profile.medianResponseMinutes,
    joinedAt: profile.joinedAt,
    identityVerifiedAt: profile.identityVerifiedAt,
    agentCredentialVerifiedAt: profile.agentCredentialVerifiedAt,
    publicBio: profile.publicBio?.trim() || null,
  };
}

async function getProfile(id: string | number): Promise<PublicUserProfileApi | null> {
  const key = String(id);
  if (!profileCache.has(key)) {
    profileCache.set(
      key,
      publicFetch<PublicUserProfileApi>(`/users/${key}/profile`).catch(() => null),
    );
  }
  return profileCache.get(key)!;
}

async function getProfiles(ids: Array<string | number>) {
  const unique = Array.from(new Set(ids.map(String))).filter(Boolean);
  const entries = await Promise.all(unique.map(async (id) => [id, await getProfile(id)] as const));
  return new Map(entries);
}

async function getPhotos(listingId: string | number): Promise<PublicPhoto[]> {
  const photos = await publicFetch<PhotoResponse[]>(`/listings/${listingId}/photos`).catch(() => []);
  return [...photos]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((photo, index) => ({
      id: String(photo.id),
      url: photo.url,
      alt: photo.caption?.trim() || `Listing photo ${index + 1}`,
    }));
}

async function getSlots(listingId: string | number): Promise<ListingSlot[]> {
  const slots = await publicFetch<SlotResponse[]>(`/listings/${listingId}/slots`).catch(() => []);
  return slots.map((slot) => ({
    id: String(slot.id),
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
  }));
}

async function enrichListing(
  listing: ListingResponse,
  profiles?: Map<string, PublicUserProfileApi | null>,
  photos?: PublicPhoto[],
): Promise<PublicListing | null> {
  const resolvedProfiles =
    profiles ??
    (await getProfiles([listing.ownerId, ...(listing.assignedAgentId ? [listing.assignedAgentId] : [])]));

  const ownerProfile = resolvedProfiles.get(String(listing.ownerId));
  if (!ownerProfile) return null;

  const owner = toPublicPerson(ownerProfile);
  const agentProfile = listing.assignedAgentId
    ? resolvedProfiles.get(String(listing.assignedAgentId))
    : null;
  const agent = agentProfile ? toPublicPerson(agentProfile) : null;

  const gallery = photos ?? (await getPhotos(listing.id));
  const serverLat = listing.property.latitude;
  const serverLng = listing.property.longitude;
  const hasServerCoords =
    typeof serverLat === "number" &&
    typeof serverLng === "number" &&
    Number.isFinite(serverLat) &&
    Number.isFinite(serverLng);
  const { latitude, longitude } = hasServerCoords
    ? { latitude: serverLat, longitude: serverLng }
    : getListingCoordinates(String(listing.id), listing.property.address);

  return {
    id: String(listing.id),
    ownerId: String(listing.ownerId),
    agentId: listing.assignedAgentId ? String(listing.assignedAgentId) : null,
    title: listing.title?.trim() || fallbackTitle(listing),
    headline: listing.headline?.trim() || fallbackHeadline(listing),
    type: listing.property.type,
    term: listing.listingType,
    location: shortLocation(listing.property.address),
    address: listing.property.address,
    priceNgn: listing.askingPrice,
    cautionFeeNgn: listing.cautionFee,
    serviceChargeNgn: listing.serviceCharge,
    agencyFeeNgn: listing.agencyFee,
    bedrooms: listing.property.bedrooms,
    bathrooms: listing.property.bathrooms,
    sizeSqm: listing.property.sizeSqm,
    description: listing.description?.trim() || fallbackDescription(listing),
    status: listing.status,
    handoverDate: listing.handoverDate,
    availableFrom: availabilityText(listing.handoverDate),
    availability: toAvailability(listing.handoverDate),
    viewCount: listing.viewCount ?? 0,
    pendingReportCount: listing.pendingReportCount ?? 0,
    publishedAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    verified: Boolean(listing.property.documentsVerifiedAt),
    verificationLabel: listing.property.documentsVerifiedAt ? "Property Verified" : "Verification pending",
    photos: gallery,
    owner,
    agent,
    comments: [],
    slots: [],
    mapArea: shortLocation(listing.property.address),
    latitude,
    longitude,
    petsAllowed: listing.petsAllowed ?? null,
    utilitiesNote: listing.utilitiesNote ?? null,
    virtualTourUrl: listing.virtualTourUrl?.trim() || null,
    priceNegotiable: listing.priceNegotiable ?? false,
    ownerPublicBio: listing.ownerPublicBio?.trim() || null,
  };
}

function includesText(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function bySort(sort: ListingSort, listings: PublicListing[]) {
  const items = [...listings];
  if (sort === "price-asc") return items.sort((a, b) => a.priceNgn - b.priceNgn);
  if (sort === "price-desc") return items.sort((a, b) => b.priceNgn - a.priceNgn);
  if (sort === "most-saved") return items.sort((a, b) => b.viewCount - a.viewCount);
  return items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

async function listBackendListings(query: Record<string, string | number | boolean | undefined | null>, size = 20) {
  return publicFetch<PagedModel<ListingResponse>>("/listings", { size, ...query });
}

export async function searchListings(input: ListingSearchInput, pageSize = 6): Promise<ListingsResult> {
  const q = input.q?.trim();
  const location = input.location?.trim();
  const bedrooms = numeric(input.bedrooms);
  const bathrooms = numeric(input.bathrooms);
  const priceMin = numeric(input.priceMin);
  const priceMax = numeric(input.priceMax);
  const verifiedOnly = input.verified === "true";
  const availability = input.availability as AvailabilityKey | undefined;
  const sort = (input.sort as ListingSort | undefined) ?? "newest";
  const page = Math.max(1, numeric(input.page) ?? 1);

  try {
    const backendPage = await listBackendListings({
      page: page - 1,
      size: pageSize,
      listingType: input.listingType,
      propertyType: input.propertyType,
      location,
      bedrooms,
      priceMin,
      priceMax,
    });

    const profiles = await getProfiles(
      backendPage.content.flatMap((listing) => [
        listing.ownerId,
        ...(listing.assignedAgentId ? [listing.assignedAgentId] : []),
      ]),
    );

    const photos = await Promise.all(
      backendPage.content.map(async (listing) => [String(listing.id), await getPhotos(listing.id)] as const),
    );
    const photoMap = new Map(photos);

    let listings = (
      await Promise.all(
        backendPage.content.map((listing) =>
          enrichListing(listing, profiles, photoMap.get(String(listing.id)) ?? []),
        ),
      )
    ).filter((listing): listing is PublicListing => listing != null);

    if (bathrooms !== undefined) listings = listings.filter((listing) => listing.bathrooms === bathrooms);
    if (verifiedOnly) listings = listings.filter((listing) => listing.verified);
    if (availability) listings = listings.filter((listing) => listing.availability === availability);
    if (q) {
      listings = listings.filter((listing) =>
        includesText(
          `${listing.title} ${listing.address} ${listing.description} ${listing.headline ?? ""}`,
          q,
        ),
      );
    }

    listings = bySort(sort, listings);

    return {
      listings,
      total: backendPage.page.totalElements,
      totalPages: backendPage.page.totalPages,
      page: backendPage.page.number + 1,
      sort,
      q,
      backendUnavailable: false,
    };
  } catch {
    return {
      listings: [],
      total: 0,
      totalPages: 1,
      page: 1,
      sort,
      q,
      backendUnavailable: true,
    };
  }
}

async function listManyListings(limit = 100) {
  const page = await listBackendListings({ page: 0, size: limit }, limit);
  const profiles = await getProfiles(
    page.content.flatMap((listing) => [
      listing.ownerId,
      ...(listing.assignedAgentId ? [listing.assignedAgentId] : []),
    ]),
  );
  const listings = await Promise.all(page.content.map((listing) => enrichListing(listing, profiles)));
  return listings.filter((listing): listing is PublicListing => listing != null);
}

export async function getDreamAiInventory(limit = 60) {
  return listManyListings(limit);
}

/**
 * Normalise a listing identifier coming from a route segment.
 *
 * URLs in Next.js dynamic routes (`/listings/[id]`) arrive percent-encoded
 * and sometimes with extra whitespace from search-form submissions. Haven's
 * listing IDs are simple stringified longs, but the route shape should
 * tolerate leading/trailing whitespace and decoded characters before we
 * pass the value to `getListingById` or use it as a comparison key.
 */
export function normalizeListingRouteId(rawId: string): string {
  if (!rawId) return "";
  let value = rawId;
  try {
    value = decodeURIComponent(value);
  } catch {
    // Malformed escape — fall through with the raw value.
  }
  return value.trim();
}

export async function getListingById(id: string): Promise<PublicListingDetail | undefined> {
  if (!listingCache.has(id)) {
    listingCache.set(
      id,
      (async () => {
        const listing = await publicFetch<ListingResponse>(`/listings/${id}`).catch(() => null);
        if (!listing) return null;

        const profiles = await getProfiles([
          listing.ownerId,
          ...(listing.assignedAgentId ? [listing.assignedAgentId] : []),
        ]);

        const [base, commentsPage, reviewsPage, slots, photos] = await Promise.all([
          enrichListing(listing, profiles),
          publicFetch<PagedModel<CommentResponse>>(`/listings/${id}/comments`, { page: 0, size: 20 }).catch(
            () => ({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } }),
          ),
          publicFetch<PagedModel<ReviewResponse>>(`/listings/${id}/reviews`, { page: 0, size: 20 }).catch(
            () => ({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } }),
          ),
          getSlots(id),
          getPhotos(id),
        ]);

        if (!base) return null;

        const authorProfiles = await getProfiles([
          ...commentsPage.content.map((comment) => comment.authorUserId),
          ...reviewsPage.content.map((review) => review.reviewerUserId),
        ]);

        const comments: ListingComment[] = commentsPage.content.map((comment) => {
          const profile = authorProfiles.get(String(comment.authorUserId));
          return {
            id: String(comment.id),
            authorName: profile ? toPublicPerson(profile).name : `User ${comment.authorUserId}`,
            authorRole:
              profile?.role === "AGENT" ? "Agent" : profile?.role === "OWNER" ? "Owner" : "Applicant",
            body: comment.body,
            date: formatDate(comment.createdAt, { dateStyle: "medium" }),
            replies: [],
          };
        });

        const reviews: PublicReview[] = reviewsPage.content.map((review) => {
          const profile = authorProfiles.get(String(review.reviewerUserId));
          return {
            id: String(review.id),
            reviewerName: profile ? toPublicPerson(profile).name : `User ${review.reviewerUserId}`,
            reviewerRole:
              profile?.role === "AGENT" ? "Agent" : profile?.role === "OWNER" ? "Owner" : "Applicant",
            rating: review.rating,
            body: review.body,
            date: formatDate(review.createdAt, { dateStyle: "medium" }),
            listingId: String(review.listingId),
          };
        });

        return {
          ...base,
          photos,
          comments,
          slots,
          reviews,
        } satisfies PublicListingDetail;
      })(),
    );
  }

  const listing = await listingCache.get(id)!;
  return listing ?? undefined;
}

export async function getSimilarListings(listingId: string, limit = 3) {
  const current = await getListingById(listingId);
  if (!current) return [];
  const listings = await listManyListings(60);
  return listings
    .filter((listing) => listing.id !== listingId)
    .sort((a, b) => {
      const scoreA =
        Number(a.location === current.location) +
        Number(a.term === current.term) +
        Number(a.type === current.type);
      const scoreB =
        Number(b.location === current.location) +
        Number(b.term === current.term) +
        Number(b.type === current.type);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export async function searchAgents(input: AgentSearchInput) {
  const sort = (input.sort as AgentSort | undefined) ?? "highest-rated";
  try {
    const url = makeUrl("/agents", {
      verified: input.verified === "true" ? true : undefined,
      page: 0,
      size: 40,
    });
    url.searchParams.set("q", input.q?.trim() ?? "");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Public API request failed: ${response.status} ${response.statusText}`);
    }

    const page = (await response.json()) as PagedModel<PublicUserProfileApi>;

    let agents = page.content
      .filter((profile) => profile.role === "AGENT" && !profile.suspended)
      .map((profile) => toPublicPerson(profile) as PublicAgent);

    const minRating = numeric(input.minRating) ?? 0;
    if (minRating) {
      agents = agents.filter((agent) => (agent.averageRating ?? 0) >= minRating);
    }

    agents = [...agents].sort((a, b) => {
      if (sort === "most-deals") return (b.closedDealCount ?? 0) - (a.closedDealCount ?? 0);
      if (sort === "newest") return (b.joinedAt ?? "") < (a.joinedAt ?? "") ? -1 : 1;
      if (sort === "most-active") return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      return (b.averageRating ?? 0) - (a.averageRating ?? 0);
    });

    return { agents, sort, backendUnavailable: false };
  } catch {
    return { agents: [] as PublicAgent[], sort, backendUnavailable: true };
  }
}

export async function getAgentById(id: string) {
  const profile = await getProfile(id);
  if (!profile || profile.role !== "AGENT") return undefined;
  return toPublicPerson(profile) as PublicAgent;
}

export async function getOwnerById(id: string) {
  const profile = await getProfile(id);
  if (!profile || profile.role !== "OWNER") return undefined;
  return toPublicPerson(profile) as PublicOwner;
}

export async function getListingsForAgent(agentId: string) {
  const listings = await listManyListings(100);
  return listings.filter((listing) => listing.agentId === agentId);
}

export async function getListingsForOwner(ownerId: string) {
  const listings = await listManyListings(100);
  return listings.filter((listing) => listing.ownerId === ownerId);
}

export async function getAgentReviews(agentId: string) {
  try {
    const reviews = await publicFetch<PagedModel<ReviewResponse>>(`/users/${agentId}/reviews`, {
      page: 0,
      size: 20,
    });
    const profiles = await getProfiles(reviews.content.map((review) => review.reviewerUserId));
    return reviews.content.map((review) => {
      const profile = profiles.get(String(review.reviewerUserId));
      return {
        id: String(review.id),
        reviewerName: profile ? toPublicPerson(profile).name : `User ${review.reviewerUserId}`,
        reviewerRole:
          profile?.role === "AGENT" ? "Agent" : profile?.role === "OWNER" ? "Owner" : "Applicant",
        rating: review.rating,
        body: review.body,
        date: formatDate(review.createdAt, { dateStyle: "medium" }),
        listingId: String(review.listingId),
      } satisfies PublicReview;
    });
  } catch {
    return [] as PublicReview[];
  }
}

export interface AgentListingInsights {
  activeCount: number;
  rentCount: number;
  saleCount: number;
  areas: string[];
  priceMinNgn: number | null;
  priceMaxNgn: number | null;
  topPropertyTypes: { label: string; count: number }[];
}

function listingPropertyLabelForInsights(type: PublicListing["type"]): string {
  switch (type) {
    case "APARTMENT":
      return "Apartments";
    case "HOUSE":
      return "Houses";
    case "LAND":
      return "Land";
    case "COMMERCIAL":
      return "Commercial";
    case "SELF_CONTAIN":
      return "Self contain";
    case "MINI_FLAT":
      return "Mini flats";
    case "STUDIO":
      return "Studios";
    case "ROOM_AND_PARLOUR":
      return "Room & parlour";
  }
  return String(type).toLowerCase().replaceAll("_", " ");
}

export function summarizeAgentListings(listings: PublicListing[]): AgentListingInsights {
  const rentCount = listings.filter((l) => l.term === "RENT").length;
  const saleCount = listings.filter((l) => l.term === "SALE").length;
  const areas = Array.from(new Set(listings.map((l) => l.location))).slice(0, 8);
  const prices = listings.map((l) => l.priceNgn);
  const priceMinNgn = prices.length ? Math.min(...prices) : null;
  const priceMaxNgn = prices.length ? Math.max(...prices) : null;
  const tally = new Map<string, number>();
  for (const listing of listings) {
    const label = listingPropertyLabelForInsights(listing.type);
    tally.set(label, (tally.get(label) ?? 0) + 1);
  }
  const topPropertyTypes = [...tally.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    activeCount: listings.length,
    rentCount,
    saleCount,
    areas,
    priceMinNgn,
    priceMaxNgn,
    topPropertyTypes,
  };
}

/** Counts of reviews per star (1–5); index 0 = 1 star. */
export function reviewRatingHistogram(reviews: PublicReview[]): [number, number, number, number, number] {
  const buckets: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating)));
    buckets[star - 1] += 1;
  }
  return buckets;
}

export async function getCompareListings(ids: string[]) {
  const listings = await Promise.all(ids.slice(0, 3).map((id) => getListingById(id)));
  return listings.filter((listing): listing is PublicListingDetail => listing != null);
}

export async function getSuggestedCompareListings(query?: string) {
  const listings = await listManyListings(60);
  const trimmed = query?.trim();
  if (!trimmed) return listings.slice(0, 6);
  return listings.filter((listing) =>
    includesText(
      `${listing.title} ${listing.address} ${listing.description} ${listing.location}`,
      trimmed,
    ),
  );
}

export function summarizeQuery(input: ListingSearchInput) {
  if (input.q?.trim()) return input.q.trim();
  const bits = [
    input.bedrooms ? `${input.bedrooms} bedroom` : undefined,
    input.location,
    input.propertyType,
    input.listingType,
  ]
    .filter(Boolean)
    .join(" ");
  return bits || "all listings";
}
