import { api } from "@/lib/api";
import { pickPrimaryListingForProperty, sortListingsNewestFirst } from "@/lib/listing-lifecycle";
import { latestPropertyDocumentsVerification, latestVerificationByType } from "@/lib/verification-helpers";
import { datetimeLocalToInstantJson } from "@/lib/datetime-api";
import {
  migrateWorkspaceInspectionLabel,
  workspaceLabelToLocalStatus,
  type WorkspaceInspectionLocalStatus,
  type WorkspaceInspectionStatusLabel,
} from "@/lib/inspection-lifecycle";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationHref,
  getNotificationPayload,
  listNotifications,
  readApplicantNotificationPreferences,
  saveApplicantNotificationPreferences,
  type ApplicantNotificationPreferences,
  type InspectionResponse,
  type NotificationResponse,
  type OfferResponse,
  type PagedModel,
  type PrivateUserProfile,
  type PublicUserProfile,
  type VerificationResponse,
} from "@/lib/applicant-dashboard";
import {
  invalidatePublicListingCache,
  getListingById,
  searchAgents,
  type PublicListingDetail,
  type PublicReview,
} from "@/lib/seed/public-data";

export interface PropertyResponse {
  id: number;
  ownerId: number;
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
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqm?: number | null;
  description?: string | null;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PropertySummary {
  id: number;
  type: PropertyResponse["type"];
  address: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sizeSqm?: number | null;
  documentsVerifiedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OwnerListingResponse {
  id: number;
  propertyId: number;
  ownerId: number;
  listingType: "RENT" | "SALE";
  askingPrice: number;
  currency?: string | null;
  cautionFee?: number | null;
  serviceCharge?: number | null;
  agencyFee?: number | null;
  title?: string | null;
  description?: string | null;
  headline?: string | null;
  handoverDate?: string | null;
  status: "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN";
  /** Optimistic-lock token from Haven (@Version). Send on PATCH when present. */
  version?: number | null;
  approvedAt?: string | null;
  viewCount?: number | null;
  createdAt: string;
  updatedAt: string;
  property: PropertySummary;
  assignedAgentId?: number | null;
  pendingReportCount?: number | null;
}

export interface PhotoResponse {
  id: number;
  listingId: number;
  url: string;
  displayOrder: number;
  caption?: string | null;
  uploadedAt: string;
}

export interface AgentListingResponse {
  id: number;
  listingId: number;
  agentUserId: number;
  requestedByOwnerId: number;
  status: "REQUESTED" | "ACCEPTED" | "DECLINED" | "REVOKED";
  decisionReason?: string | null;
  automatedChecks?: import("@/lib/verification-types").AutomatedCheckResultResponse[] | null;
  requestedAt: string;
  decidedAt?: string | null;
}

export interface CommentResponse {
  id: number;
  listingId: number;
  authorUserId: number;
  body: string;
  createdAt: string;
}

export interface SlotResponse {
  id: number;
  listingId: number;
  startsAt: string;
  endsAt: string;
}

export interface OwnerListingBundle {
  listing: OwnerListingResponse;
  detail: PublicListingDetail | null;
}

export interface OwnerManagedProperty {
  property: PropertyResponse;
  listing: OwnerListingResponse | null;
  listingDetail: PublicListingDetail | null;
  /** Other listings on the same property (newest first), excluding the primary `listing`. */
  pastListings?: OwnerListingBundle[];
}

export interface OwnerActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  href: string;
}

export interface OwnerDashboardOverview {
  totalProperties: number;
  activeListings: number;
  pendingInspectionRequests: number;
  newOffers: number;
  unreadNotifications: number;
  propertiesOverview: OwnerManagedProperty[];
  recentActivity: OwnerActivityItem[];
  showVerificationBanner: boolean;
  latestIdentityVerification: VerificationResponse | null;
}

export type LeadTemperature = "Hot" | "Warm" | "Cold";

export interface OwnerLead {
  key: string;
  applicantId: number;
  applicantName: string;
  listingId: number;
  listingTitle: string;
  listingLocation: string;
  temperature: LeadTemperature;
  lastActivityAt: string;
  sourceSummary: string;
  shortlist: boolean;
  /** Haven formal lead row when `GET /listings/{id}/leads` returned it. */
  havenLeadId?: number | null;
  contactRevealed?: boolean;
  contactPhone?: string | null;
  contactEmail?: string | null;
  leadMessage?: string | null;
}

export interface ListingLeadResponse {
  id: number;
  listingId: number;
  applicantUserId: number;
  message?: string | null;
  createdAt: string;
  revealed: boolean;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export interface OwnerCommentItem {
  comment: CommentResponse;
  authorName: string;
  listing: OwnerListingResponse | null;
}

export interface OwnerInspectionItem {
  notification: NotificationResponse;
  listing: OwnerListingResponse | null;
  requestedAt: string;
  applicantName: string;
  statusLabel: WorkspaceInspectionStatusLabel;
  localStatus: WorkspaceInspectionLocalStatus;
  /** When the notification payload carries a Haven inspection id, owner actions can call the API. */
  inspectionId: number | null;
}

export interface OwnerPropertyFormDraft {
  basic: {
    address: string;
    type: PropertyResponse["type"];
    bedrooms: string;
    bathrooms: string;
    sizeSqm: string;
    description: string;
  };
  terms: {
    listingType: "RENT" | "SALE";
    askingPrice: string;
    cautionFee: string;
    serviceCharge: string;
    agencyFee: string;
    negotiable: boolean;
    availabilityDate: string;
  };
  photos: Array<{ name: string; caption: string }>;
  documents: Array<{ name: string; kind: string }>;
  virtualTourLink: string;
};

export interface OwnerProfileDraft {
  bio: string;
  profilePhotoDataUrl: string | null;
}

const OWNER_PROPERTY_DRAFT_KEY = "dreamhomes.owner.property-draft";
const OWNER_PROFILE_DRAFT_KEY = "dreamhomes.owner.profile-draft";
const OWNER_LEAD_SHORTLIST_KEY = "dreamhomes.owner.lead-shortlist";
const OWNER_INSPECTION_STATUS_KEY = "dreamhomes.owner.inspection-status";
const OWNER_INSPECTION_NOTES_KEY = "dreamhomes.owner.inspection-notes";

export const DEFAULT_PROPERTY_DRAFT: OwnerPropertyFormDraft = {
  basic: {
    address: "",
    type: "APARTMENT",
    bedrooms: "",
    bathrooms: "",
    sizeSqm: "",
    description: "",
  },
  terms: {
    listingType: "RENT",
    askingPrice: "",
    cautionFee: "",
    serviceCharge: "",
    agencyFee: "",
    negotiable: true,
    availabilityDate: "",
  },
  photos: [],
  documents: [],
  virtualTourLink: "",
};

export const DEFAULT_OWNER_PROFILE_DRAFT: OwnerProfileDraft = {
  bio: "",
  profilePhotoDataUrl: null,
};

function getPageTotal<T>(response: PagedModel<T>) {
  return response.page?.totalElements ?? response.content.length;
}

function storageKey(baseKey: string, userId: number) {
  return `${baseKey}.${userId}`;
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function loadListingDetailMap(listingIds: number[]) {
  const uniqueIds = [...new Set(listingIds)];
  const entries = await Promise.all(
    uniqueIds.map(async (listingId) => {
      try {
        const detail = await getListingById(String(listingId));
        return [listingId, detail ?? null] as const;
      } catch {
        return [listingId, null] as const;
      }
    }),
  );

  return new Map<number, PublicListingDetail | null>(entries);
}

async function loadPublicUserProfiles(userIds: number[]) {
  const uniqueIds = [...new Set(userIds)];
  const profiles = await Promise.all(
    uniqueIds.map(async (userId) => {
      try {
        const profile = await api.get<PublicUserProfile>(`/users/${userId}/profile`, { skipAuth: true });
        return [userId, profile] as const;
      } catch {
        return [userId, null] as const;
      }
    }),
  );

  return new Map<number, PublicUserProfile | null>(profiles);
}

export async function listOwnerListings(size = 100) {
  const response = await api.get<PagedModel<OwnerListingResponse>>("/listings/mine", {
    query: { page: 0, size },
  });
  const detailMap = await loadListingDetailMap(response.content.map((listing) => listing.id));

  return {
    total: getPageTotal(response),
    items: response.content.map((listing) => ({
      listing,
      detail: detailMap.get(listing.id) ?? null,
    })),
  };
}

export async function listOwnerProperties(size = 100) {
  const [propertiesResponse, ownerListings] = await Promise.all([
    api.get<PagedModel<PropertyResponse>>("/properties/mine", { query: { page: 0, size } }),
    listOwnerListings(100),
  ]);

  const listingsByPropertyId = new Map<number, OwnerListingBundle[]>();
  const detailByListingId = new Map<number, PublicListingDetail | null>();

  for (const item of ownerListings.items) {
    detailByListingId.set(item.listing.id, item.detail);
    const bucket = listingsByPropertyId.get(item.listing.propertyId) ?? [];
    bucket.push({ listing: item.listing, detail: item.detail });
    listingsByPropertyId.set(item.listing.propertyId, bucket);
  }

  return {
    total: getPageTotal(propertiesResponse),
    items: propertiesResponse.content.map((property) => {
      const bundles = sortListingsNewestFirst(
        (listingsByPropertyId.get(property.id) ?? []).map((row) => row.listing),
      ).map((listing) => ({
        listing,
        detail: detailByListingId.get(listing.id) ?? null,
      }));
      const primary = pickPrimaryListingForProperty(
        bundles.map((row) => row.listing),
        property.id,
      );
      const pastListings = primary
        ? bundles.filter((row) => row.listing.id !== primary.id)
        : bundles.slice(1);

      return {
        property,
        listing: primary,
        listingDetail: primary ? detailByListingId.get(primary.id) ?? null : null,
        pastListings,
      } satisfies OwnerManagedProperty;
    }),
  };
}

export async function listOwnerOffers(ownerUserId: number, size = 100) {
  const response = await api.get<PagedModel<OfferResponse>>("/offers/mine", {
    query: { page: 0, size },
  });
  const ownedOffers = response.content.filter((offer) => offer.ownerId === ownerUserId);
  const detailMap = await loadListingDetailMap(ownedOffers.map((offer) => offer.listingId));

  return ownedOffers
    .map((offer) => ({
      offer,
      listing: detailMap.get(offer.listingId) ?? null,
    }))
    .sort((left, right) => new Date(right.offer.updatedAt).getTime() - new Date(left.offer.updatedAt).getTime());
}

export async function listOwnerAssignments(size = 100) {
  const response = await api.get<PagedModel<AgentListingResponse>>("/agent-listings/mine", {
    query: { page: 0, size },
  });
  const detailMap = await loadListingDetailMap(response.content.map((assignment) => assignment.listingId));
  const agentProfiles = await loadPublicUserProfiles(response.content.map((assignment) => assignment.agentUserId));

  return response.content.map((assignment) => ({
    assignment,
    listing: detailMap.get(assignment.listingId) ?? null,
    agentProfile: agentProfiles.get(assignment.agentUserId) ?? null,
  }));
}

export async function listOwnerComments(ownerUserId: number) {
  const ownerListings = await listOwnerListings(100);
  const commentsPages = await Promise.all(
    ownerListings.items.map(async ({ listing }) => {
      const page = await api.get<PagedModel<CommentResponse>>(`/listings/${listing.id}/comments`, {
        skipAuth: true,
        query: { page: 0, size: 100 },
      });
      return page.content.map((comment) => ({ comment, listing }));
    }),
  );

  const flattened = commentsPages.flat().filter((item) => item.comment.authorUserId !== ownerUserId);
  const authorProfiles = await loadPublicUserProfiles(flattened.map((item) => item.comment.authorUserId));

  return flattened
    .map((item) => ({
      comment: item.comment,
      authorName: authorProfiles.get(item.comment.authorUserId)?.fullName ?? `User #${item.comment.authorUserId}`,
      listing: item.listing,
    }))
    .sort(
      (left, right) =>
        new Date(right.comment.createdAt).getTime() - new Date(left.comment.createdAt).getTime(),
    );
}

function pickInspectionIdFromPayload(payload: unknown): number | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const raw = payload as Record<string, unknown>;
  for (const key of ["inspectionRequestId", "inspectionId", "inspection_id"]) {
    const v = raw[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  }
  return null;
}

export async function listOwnerLeads(ownerUserId: number) {
  const [offers, comments, ownerListingsPage] = await Promise.all([
    listOwnerOffers(ownerUserId, 100),
    listOwnerComments(ownerUserId),
    listOwnerListings(100),
  ]);

  const shortlistSet = readLeadShortlist(ownerUserId);
  const leadMap = new Map<string, Omit<OwnerLead, "shortlist">>();

  for (const item of comments) {
    if (!item.listing) continue;
    const key = `${item.comment.authorUserId}-${item.comment.listingId}`;
    leadMap.set(key, {
      key,
      applicantId: item.comment.authorUserId,
      applicantName: item.authorName,
      listingId: item.comment.listingId,
      listingTitle: item.listing.title ?? `Listing #${item.comment.listingId}`,
      listingLocation: item.listing.property.address,
      temperature: "Warm",
      lastActivityAt: item.comment.createdAt,
      sourceSummary: "Asked a public question on your listing",
    });
  }

  for (const item of offers) {
    const key = `${item.offer.applicantId}-${item.offer.listingId}`;
    const existing = leadMap.get(key);
    leadMap.set(key, {
      key,
      applicantId: item.offer.applicantId,
      applicantName: existing?.applicantName ?? `Applicant #${item.offer.applicantId}`,
      listingId: item.offer.listingId,
      listingTitle: item.listing?.title ?? `Listing #${item.offer.listingId}`,
      listingLocation: item.listing?.location ?? "Listing location",
      temperature: "Hot",
      lastActivityAt:
        existing && new Date(existing.lastActivityAt).getTime() > new Date(item.offer.updatedAt).getTime()
          ? existing.lastActivityAt
          : item.offer.updatedAt,
      sourceSummary: existing
        ? `${existing.sourceSummary}; also sent an offer`
        : "Submitted an offer on your listing",
    });
  }

  const listingMeta = new Map(
    ownerListingsPage.items.map(({ listing }) => [
      listing.id,
      {
        title: listing.title ?? `Listing #${listing.id}`,
        location: listing.property.address,
      },
    ]),
  );

  await Promise.all(
    ownerListingsPage.items.map(async ({ listing }) => {
      try {
        const page = await api.get<PagedModel<ListingLeadResponse>>(`/listings/${listing.id}/leads`, {
          query: { page: 0, size: 50 },
        });
        for (const row of page.content) {
          const key = `${row.applicantUserId}-${row.listingId}`;
          const meta = listingMeta.get(row.listingId);
          const listingTitle = meta?.title ?? `Listing #${row.listingId}`;
          const listingLocation = meta?.location ?? "Listing location";
          const existing = leadMap.get(key);
          const summaryFromRow = row.message?.trim()
            ? `Listing lead: ${row.message.trim()}`
            : "Submitted a formal interest request on your listing";
          leadMap.set(key, {
            key,
            applicantId: row.applicantUserId,
            applicantName: existing?.applicantName ?? `Applicant #${row.applicantUserId}`,
            listingId: row.listingId,
            listingTitle,
            listingLocation,
            temperature: "Hot",
            lastActivityAt:
              existing && new Date(existing.lastActivityAt).getTime() > new Date(row.createdAt).getTime()
                ? existing.lastActivityAt
                : row.createdAt,
            sourceSummary: existing ? `${existing.sourceSummary}; ${summaryFromRow}` : summaryFromRow,
            havenLeadId: row.id,
            contactRevealed: row.revealed,
            contactPhone: row.contactPhone ?? null,
            contactEmail: row.contactEmail ?? null,
            leadMessage: row.message ?? null,
          });
        }
      } catch {
        /* Not every listing exposes leads to this caller. */
      }
    }),
  );

  const applicantProfiles = await loadPublicUserProfiles([...leadMap.values()].map((lead) => lead.applicantId));

  return [...leadMap.values()]
    .map((lead) => ({
      ...lead,
      applicantName: applicantProfiles.get(lead.applicantId)?.fullName ?? lead.applicantName,
      shortlist: shortlistSet.has(lead.key),
    }))
    .sort((left, right) => new Date(right.lastActivityAt).getTime() - new Date(left.lastActivityAt).getTime());
}

export async function listOwnerWorkspaceInspections(userId: number) {
  const ownerListings = await listOwnerListings(100);
  const listingIds = new Set(ownerListings.items.map((item) => item.listing.id));
  const { listWorkspaceInspections } = await import("@/lib/workspace-inspections");
  return listWorkspaceInspections({ userId, listingIds });
}

/** @deprecated Use listOwnerWorkspaceInspections for Haven-backed status and actions. */
export async function listOwnerInspectionItems(userId: number) {
  const notifications = await listNotifications({ size: 80, kind: "INSPECTION_REQUESTED" });

  const ownerListings = await listOwnerListings(100);
  const listingMap = new Map(ownerListings.items.map((item) => [item.listing.id, item.listing] as const));
  const localStatuses = readInspectionStatuses(userId);

  return notifications.items.map((notification) => {
    const payload = getNotificationPayload(notification);
    const payloadRecord = payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : null;
    const listingId =
      typeof payloadRecord?.listingId === "number"
        ? payloadRecord.listingId
        : typeof payloadRecord?.listingId === "string" && /^\d+$/.test(payloadRecord.listingId)
          ? Number(payloadRecord.listingId)
          : null;
    const applicantId =
      typeof payloadRecord?.applicantId === "number"
        ? payloadRecord.applicantId
        : typeof payloadRecord?.applicantId === "string" && /^\d+$/.test(payloadRecord.applicantId)
          ? Number(payloadRecord.applicantId)
          : null;
    const listing = listingId ? listingMap.get(listingId) ?? null : null;
    const inspectionId = pickInspectionIdFromPayload(payload);

    return {
      notification,
      listing,
      requestedAt: notification.createdAt,
      applicantName: applicantId ? `Applicant #${applicantId}` : "Interested applicant",
      statusLabel: migrateWorkspaceInspectionLabel(localStatuses[notification.id] ?? "Pending"),
      localStatus: workspaceLabelToLocalStatus(
        migrateWorkspaceInspectionLabel(localStatuses[notification.id] ?? "Pending"),
      ),
      inspectionId,
    };
  });
}

export async function getOwnerProfileData(userId: number) {
  const [privateProfile, publicProfile, reviewsPage, verificationsPage, ownerOffers] = await Promise.all([
    api.get<PrivateUserProfile>("/me/profile"),
    api.get<PublicUserProfile>(`/users/${userId}/profile`, { skipAuth: true }),
    api.get<PagedModel<PublicReview>>(`/users/${userId}/reviews`, {
      skipAuth: true,
      query: { page: 0, size: 8 },
    }),
    api.get<PagedModel<VerificationResponse>>("/verifications/mine", {
      query: { page: 0, size: 30 },
    }),
    listOwnerOffers(userId, 100),
  ]);

  const incomingOffers = ownerOffers.filter((item) => item.offer.proposedByUserId !== userId);
  const respondedOffers = incomingOffers.filter((item) => item.offer.status !== "PENDING");
  const responseRate = incomingOffers.length > 0 ? Math.round((respondedOffers.length / incomingOffers.length) * 100) : 0;

  const responseDurations = incomingOffers
    .filter((item) => item.offer.status !== "PENDING")
    .map((item) => new Date(item.offer.updatedAt).getTime() - new Date(item.offer.createdAt).getTime())
    .filter((duration) => duration > 0);

  const averageResponseHours =
    responseDurations.length > 0
      ? Math.round(responseDurations.reduce((sum, duration) => sum + duration, 0) / responseDurations.length / 3_600_000)
      : null;

  return {
    privateProfile,
    publicProfile,
    reviews: reviewsPage.content,
    verifications: verificationsPage.content,
    responseRate,
    averageResponseHours,
  };
}

export async function getOwnerDashboardOverview(userId: number): Promise<OwnerDashboardOverview> {
  const [properties, listings, offers, notifications, unreadCount, profileData] = await Promise.all([
    listOwnerProperties(100),
    listOwnerListings(100),
    listOwnerOffers(userId, 100),
    listNotifications({ size: 50 }),
    api.get<{ unread: number }>("/notifications/mine/unread-count"),
    getOwnerProfileData(userId),
  ]);

  const newOffers = offers.filter(
    (item) => item.offer.proposedByUserId !== userId && item.offer.status === "PENDING",
  ).length;

  return {
    totalProperties: properties.total,
    activeListings: listings.items.filter((item) => item.listing.status === "LIVE").length,
    pendingInspectionRequests: notifications.items.filter((item) => item.kind === "INSPECTION_REQUESTED").length,
    newOffers,
    unreadNotifications: unreadCount.unread,
    propertiesOverview: properties.items.slice(0, 4),
    recentActivity: notifications.items.slice(0, 5).map((notification) => ({
      id: String(notification.id),
      title: notification.kind.replaceAll("_", " "),
      description: notification.body ?? "New platform activity on one of your listings.",
      occurredAt: notification.createdAt,
      href: getNotificationHref(notification),
    })),
    showVerificationBanner: !profileData.privateProfile.identityVerifiedAt,
    latestIdentityVerification: latestVerificationByType(profileData.verifications, "OWNER_IDENTITY"),
  };
}

export async function getOwnerPropertyManagement(propertyId: number, ownerUserId: number) {
  const [property, ownerListings, assignments, offers, comments, verifications] = await Promise.all([
    api.get<PropertyResponse>(`/properties/${propertyId}`),
    listOwnerListings(100),
    listOwnerAssignments(100),
    listOwnerOffers(ownerUserId, 100),
    listOwnerComments(ownerUserId),
    api.get<PagedModel<VerificationResponse>>("/verifications/mine", {
      query: { page: 0, size: 30 },
    }),
  ]);

  const propertyBundles = ownerListings.items.filter((item) => item.listing.propertyId === propertyId);
  const sortedBundles = sortListingsNewestFirst(propertyBundles.map((item) => item.listing)).map((listing) => {
    const match = propertyBundles.find((item) => item.listing.id === listing.id)!;
    return { listing, detail: match.detail };
  });
  const primaryListing = pickPrimaryListingForProperty(
    sortedBundles.map((row) => row.listing),
    propertyId,
  );
  const listingBundle = primaryListing
    ? (sortedBundles.find((row) => row.listing.id === primaryListing.id) ?? null)
    : null;
  const listingHistory = primaryListing
    ? sortedBundles.filter((row) => row.listing.id !== primaryListing.id)
    : sortedBundles;

  return {
    property,
    listingBundle,
    listingHistory,
    assignments: assignments.filter((item) => item.assignment.listingId === listingBundle?.listing.id),
    offers: offers.filter((item) => item.offer.listingId === listingBundle?.listing.id),
    comments: comments.filter((item) => item.comment.listingId === listingBundle?.listing.id),
    propertyVerification: latestPropertyDocumentsVerification(verifications.content, propertyId),
  };
}

export async function createOwnerProperty(payload: {
  address: string;
  type: PropertyResponse["type"];
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  description?: string;
}) {
  return api.post<PropertyResponse>("/properties", payload);
}

export async function createOwnerListing(payload: {
  propertyId: number;
  listingType: "RENT" | "SALE";
  askingPrice: number;
  cautionFee?: number;
  serviceCharge?: number;
  agencyFee?: number;
  title?: string;
  description?: string;
  headline?: string;
  handoverDate?: string;
}) {
  return api.post<OwnerListingResponse>("/listings", payload);
}

export async function updateOwnerListing(
  listingId: number,
  payload: {
    askingPrice?: number;
    status?: OwnerListingResponse["status"];
    title?: string;
    description?: string;
    headline?: string;
    handoverDate?: string;
    version?: number | null;
  },
) {
  const body: Record<string, unknown> = { ...payload };
  if (payload.version == null) {
    delete body.version;
  }
  return api.patch<OwnerListingResponse>(`/listings/${listingId}`, body);
}

/**
 * Upload a listing photo via haven's presigned R2 flow.
 *
 * The flow:
 *   1. POST `/listings/{id}/photos/upload-url` to mint a presigned R2 PUT URL.
 *   2. Browser PUTs the file directly to R2.
 *   3. POST `/listings/{id}/photos/confirm` so haven records the photo row.
 *
 * If step 2 fails (almost always R2 CORS, sometimes a dropped connection),
 * the error propagates as `PresignedR2UploadError`. We deliberately do NOT
 * fall back to direct multipart upload here: that endpoint is gone in current
 * haven builds, and the old fallback returned 413s that made it look like
 * the user's file was too big when the real problem was R2 CORS.
 */
export async function uploadOwnerListingPhoto(listingId: number, file: File, caption?: string) {
  const { uploadListingPhotoDirect } = await import("@/lib/listing-photo-upload");
  const result = await uploadListingPhotoDirect(listingId, file, { caption });
  invalidatePublicListingCache(String(listingId));
  return result;
}

async function uploadVerificationFiles(files: File[]) {
  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const formData = new FormData();
      formData.set("file", file);
      const upload = await api.post<{ url: string }>("/verifications/files", formData);

      return [`document_${index + 1}`, { kind: file.name, ref: upload.url }] as const;
    }),
  );

  return Object.fromEntries(uploads);
}

export async function submitOwnerIdentityVerification(files: File[], livenessCheckId?: number) {
  const documentRefs = await uploadVerificationFiles(files);
  return api.post<VerificationResponse>("/verifications", {
    type: "OWNER_IDENTITY",
    documentRefs,
    ...(livenessCheckId != null ? { livenessCheckId } : {}),
  });
}

export async function submitPropertyDocumentsVerification(propertyId: number, files: File[]) {
  const documentRefs = await uploadVerificationFiles(files);
  return api.post<VerificationResponse>("/verifications", {
    type: "PROPERTY_DOCUMENTS",
    propertyId,
    documentRefs,
  });
}

export async function listListingSlots(listingId: number) {
  return api.get<SlotResponse[]>(`/listings/${listingId}/slots`, { skipAuth: true });
}

export async function createInspectionSlot(listingId: number, payload: { startsAt: string; endsAt: string }) {
  const result = await api.post<SlotResponse>(`/listings/${listingId}/slots`, {
    startsAt: datetimeLocalToInstantJson(payload.startsAt),
    endsAt: datetimeLocalToInstantJson(payload.endsAt),
  });
  invalidatePublicListingCache(String(listingId));
  return result;
}

export async function deleteOwnerListingPhoto(listingId: number, photoId: number) {
  await api.delete<void>(`/listings/photos/${photoId}`);
  invalidatePublicListingCache(String(listingId));
}

export async function inviteAgentToListing(listingId: number, agentId: number) {
  return api.post<AgentListingResponse>(`/listings/${listingId}/agent-assignment`, { agentId });
}

export async function revokeAgentAssignment(assignmentId: number, reason: string) {
  return api.post<AgentListingResponse>(`/agent-listings/${assignmentId}/revoke`, { reason });
}

export async function counterOwnerOffer(offerId: number, payload: { amount: number; message?: string }) {
  return api.post<OfferResponse>(`/offers/${offerId}/counter`, payload);
}

export async function replyToListingComment(listingId: number, body: string) {
  return api.post<CommentResponse>(`/listings/${listingId}/comments`, { body });
}

export async function removeListingComment(commentId: number, reason = "Owner moderation") {
  return api.delete<void>(`/comments/${commentId}`, { body: { reason } });
}

export async function searchAssignableAgents(query: string) {
  const result = await searchAgents({ q: query, verified: "false" });
  return result.agents;
}

export function readOwnerPropertyDraft(userId: number) {
  return readFromStorage(storageKey(OWNER_PROPERTY_DRAFT_KEY, userId), DEFAULT_PROPERTY_DRAFT);
}

export function saveOwnerPropertyDraft(userId: number, draft: OwnerPropertyFormDraft) {
  writeToStorage(storageKey(OWNER_PROPERTY_DRAFT_KEY, userId), draft);
}

export function readOwnerProfileDraft(userId: number) {
  return readFromStorage(storageKey(OWNER_PROFILE_DRAFT_KEY, userId), DEFAULT_OWNER_PROFILE_DRAFT);
}

export function saveOwnerProfileDraft(userId: number, draft: OwnerProfileDraft) {
  writeToStorage(storageKey(OWNER_PROFILE_DRAFT_KEY, userId), draft);
}

export function readOwnerNotificationPreferences(userId: number) {
  return readApplicantNotificationPreferences(userId);
}

export function saveOwnerNotificationPreferences(
  userId: number,
  preferences: ApplicantNotificationPreferences,
) {
  saveApplicantNotificationPreferences(userId, preferences);
}

export function readLeadShortlist(userId: number) {
  return new Set<string>(readFromStorage(storageKey(OWNER_LEAD_SHORTLIST_KEY, userId), [] as string[]));
}

export function toggleLeadShortlist(userId: number, leadKey: string) {
  const shortlist = readLeadShortlist(userId);
  if (shortlist.has(leadKey)) {
    shortlist.delete(leadKey);
  } else {
    shortlist.add(leadKey);
  }
  writeToStorage(storageKey(OWNER_LEAD_SHORTLIST_KEY, userId), [...shortlist]);
}

export function readInspectionStatuses(userId: number) {
  const raw = readFromStorage<Record<number, string>>(storageKey(OWNER_INSPECTION_STATUS_KEY, userId), {});
  const migrated: Record<number, WorkspaceInspectionStatusLabel> = {};
  for (const [key, value] of Object.entries(raw)) {
    migrated[Number(key)] = migrateWorkspaceInspectionLabel(value);
  }
  return migrated;
}

export function saveInspectionStatus(
  userId: number,
  notificationId: number,
  status: WorkspaceInspectionStatusLabel,
) {
  const current = readInspectionStatuses(userId);
  current[notificationId] = status;
  writeToStorage(storageKey(OWNER_INSPECTION_STATUS_KEY, userId), current);
}

export function readInspectionNotes(userId: number) {
  return readFromStorage<Record<number, string>>(storageKey(OWNER_INSPECTION_NOTES_KEY, userId), {});
}

export function saveInspectionNote(userId: number, notificationId: number, note: string) {
  const current = readInspectionNotes(userId);
  current[notificationId] = note;
  writeToStorage(storageKey(OWNER_INSPECTION_NOTES_KEY, userId), current);
}

export async function revealOwnerListingLead(listingId: number, leadId: number) {
  return api.post<ListingLeadResponse>(`/listings/${listingId}/leads/${leadId}/reveal`, {});
}

export async function ownerApproveInspectionRequest(inspectionId: number) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/owner/approve`, {});
}

export async function ownerDeclineInspectionRequest(inspectionId: number) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/owner/decline`, {});
}

export async function ownerMarkInspectionNoShow(inspectionId: number) {
  return api.post<InspectionResponse>(`/inspections/${inspectionId}/mark-no-show`, {});
}

export async function updateOwnerProperty(
  propertyId: number,
  payload: Partial<{
    address: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sizeSqm: number | null;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
  }>,
) {
  return api.patch<PropertyResponse>(`/properties/${propertyId}`, payload);
}

export { DEFAULT_NOTIFICATION_PREFERENCES };
