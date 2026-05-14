import { ApiError, api } from "@/lib/api";
import {
  getListingById,
  type PublicListingDetail,
  type PublicReview,
} from "@/lib/seed/public-data";
import type { Role } from "@/lib/types";

export interface PagedModel<T> {
  content: T[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface SaveRecord {
  userId: number;
  listingId: number;
  savedAt: string;
}

export type OfferIntent = "RENT" | "BUY" | "RENT_TO_BUY";
export type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "COUNTERED" | "WITHDRAWN";

export interface OfferResponse {
  id: number;
  listingId: number;
  applicantId: number;
  ownerId: number;
  amount: number;
  currency: string;
  message?: string | null;
  intent: OfferIntent;
  status: OfferStatus;
  parentOfferId?: number | null;
  proposedByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationKind =
  | "INSPECTION_REQUESTED"
  | "OFFER_SUBMITTED"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "LISTING_APPROVED"
  | "LISTING_TAKEDOWN"
  | "COMMENT_POSTED"
  | "AGENT_ASSIGNMENT_REQUESTED"
  | "AGENT_ASSIGNMENT_ACCEPTED"
  | "AGENT_ASSIGNMENT_DECLINED"
  | "AGENT_ASSIGNMENT_REVOKED"
  | "REVIEW_RECEIVED"
  | "OFFER_COUNTERED"
  | "OFFER_AUTO_DECLINED"
  | "LISTING_REPORTED"
  | "LISTING_REPORT_RESOLVED"
  | "WELCOME"
  | "VERIFICATION_SUBMITTED"
  | "INSPECTION_BOOKED"
  | "OFFER_RECEIVED_BY_PLATFORM";

export interface NotificationResponse {
  id: number;
  eventId?: string;
  recipientId: number;
  kind: NotificationKind;
  source: "SYNC" | "ASYNC_KAFKA";
  body?: string | null;
  payload?: string | Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface PrivateUserProfile {
  userId: number;
  email?: string;
  fullName: string;
  displayName?: string | null;
  phone?: string | null;
  role: Role;
  identityVerifiedAt?: string | null;
  agentCredentialVerifiedAt?: string | null;
  licenseNumber?: string | null;
  agency?: string | null;
  suspended?: boolean;
  joinedAt?: string | null;
}

export interface PublicUserProfile {
  id: number;
  fullName: string;
  role: Role;
  identityVerifiedAt?: string | null;
  agentCredentialVerifiedAt?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  suspended?: boolean;
}

export interface VerificationResponse {
  id: number;
  type: "OWNER_IDENTITY" | "PROPERTY_DOCUMENTS" | "AGENT_CREDENTIALS" | "APPLICANT_IDENTITY";
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitterUserId: number;
  targetUserId?: number | null;
  targetPropertyId?: number | null;
  documentRefs?: Record<string, unknown> | string | null;
  submittedAt: string;
  decidedAt?: string | null;
}

export interface SlotResponse {
  id: number;
  listingId: number;
  startsAt: string;
  endsAt: string;
}

export interface InspectionResponse {
  id: number;
  slotId: number;
  applicantId: number;
  status: "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedSavedListing {
  save: SaveRecord;
  listing: PublicListingDetail | null;
}

export interface EnrichedOffer {
  offer: OfferResponse;
  listing: PublicListingDetail | null;
}

export interface EnrichedInspection {
  inspection: InspectionResponse;
  slot: SlotResponse | null;
  listing: PublicListingDetail | null;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  href: string;
}

export interface ApplicantDashboardOverview {
  savedCount: number;
  upcomingInspectionCount: number;
  activeOfferCount: number;
  unreadNotificationCount: number;
  savedPreview: EnrichedSavedListing[];
  inspectionPreview: EnrichedInspection[];
  offerPreview: EnrichedOffer[];
  recentActivity: ActivityItem[];
}

export interface ApplicantProfileDraft {
  bio: string;
  profilePhotoDataUrl: string | null;
}

export interface ApplicantNotificationPreferences {
  inspectionUpdates: boolean;
  offerUpdates: boolean;
  platformAnnouncements: boolean;
  email: boolean;
  inApp: boolean;
}

const PROFILE_DRAFT_STORAGE_KEY = "dreamhomes.applicant.profile-draft";
const NOTIFICATION_PREFS_STORAGE_KEY = "dreamhomes.applicant.notification-prefs";

const DEFAULT_PROFILE_DRAFT: ApplicantProfileDraft = {
  bio: "",
  profilePhotoDataUrl: null,
};

export const DEFAULT_NOTIFICATION_PREFERENCES: ApplicantNotificationPreferences = {
  inspectionUpdates: true,
  offerUpdates: true,
  platformAnnouncements: true,
  email: true,
  inApp: true,
};

function getStorageKey(baseKey: string, userId: number) {
  return `${baseKey}.${userId}`;
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

async function loadListingMap(listingIds: number[]) {
  const uniqueIds = [...new Set(listingIds)];
  const entries = await Promise.all(
    uniqueIds.map(async (listingId) => {
      try {
        const listing = await getListingById(String(listingId));
        return [listingId, listing ?? null] as const;
      } catch {
        return [listingId, null] as const;
      }
    }),
  );

  return new Map<number, PublicListingDetail | null>(entries);
}

function getPageTotal<T>(response: PagedModel<T>) {
  return response.page?.totalElements ?? response.content.length;
}

function parseNotificationPayload(payload: NotificationResponse["payload"]) {
  if (payload == null) return null;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return payload;
}

async function resolveInspectionSlots(inspections: InspectionResponse[]) {
  const unresolved = new Set(inspections.map((inspection) => inspection.slotId));
  const slotMap = new Map<number, SlotResponse>();
  const listingIdsToHydrate = new Set<number>();
  let page = 0;
  let totalPages = 1;

  while (unresolved.size > 0 && page < totalPages) {
    const listingPage = await api.get<PagedModel<{ id: number }>>("/listings", {
      skipAuth: true,
      query: { page, size: 100 },
    });

    totalPages = listingPage.page?.totalPages ?? 1;

    const slotResults = await Promise.all(
      listingPage.content.map(async (listing) => {
        try {
          const slots = await api.get<SlotResponse[]>(`/listings/${listing.id}/slots`, { skipAuth: true });
          return { listingId: listing.id, slots };
        } catch {
          return { listingId: listing.id, slots: [] as SlotResponse[] };
        }
      }),
    );

    for (const result of slotResults) {
      for (const slot of result.slots) {
        if (unresolved.has(slot.id)) {
          slotMap.set(slot.id, slot);
          listingIdsToHydrate.add(result.listingId);
          unresolved.delete(slot.id);
        }
      }
    }

    page += 1;
  }

  const listingMap = await loadListingMap([...listingIdsToHydrate]);

  return inspections.map((inspection) => {
    const slot = slotMap.get(inspection.slotId) ?? null;
    const listing = slot ? listingMap.get(slot.listingId) ?? null : null;

    return { inspection, slot, listing };
  });
}

export async function listSavedListings(size = 20): Promise<{
  items: EnrichedSavedListing[];
  total: number;
}> {
  const response = await api.get<PagedModel<SaveRecord>>("/saves/mine", { query: { page: 0, size } });
  const listingMap = await loadListingMap(response.content.map((save) => save.listingId));

  return {
    total: getPageTotal(response),
    items: response.content.map((save) => ({
      save,
      listing: listingMap.get(save.listingId) ?? null,
    })),
  };
}

export async function listOffers(size = 50): Promise<{
  items: EnrichedOffer[];
  total: number;
}> {
  const response = await api.get<PagedModel<OfferResponse>>("/offers/mine", { query: { page: 0, size } });
  const listingMap = await loadListingMap(response.content.map((offer) => offer.listingId));

  return {
    total: getPageTotal(response),
    items: response.content.map((offer) => ({
      offer,
      listing: listingMap.get(offer.listingId) ?? null,
    })),
  };
}

export async function listNotifications(
  options: {
    size?: number;
    unreadOnly?: boolean;
    kind?: NotificationKind;
  } = {},
): Promise<{
  items: NotificationResponse[];
  total: number;
}> {
  const response = await api.get<PagedModel<NotificationResponse>>("/notifications/mine", {
    query: {
      page: 0,
      size: options.size ?? 30,
      unreadOnly: options.unreadOnly,
      kind: options.kind,
    },
  });

  return {
    items: response.content,
    total: getPageTotal(response),
  };
}

export async function listInspections(size = 30): Promise<{
  items: EnrichedInspection[];
  total: number;
}> {
  const response = await api.get<PagedModel<InspectionResponse>>("/inspections/mine", {
    query: { page: 0, size },
  });

  return {
    items: await resolveInspectionSlots(response.content),
    total: getPageTotal(response),
  };
}

export async function getUnreadNotificationCount() {
  return api.get<{ unread: number }>("/notifications/mine/unread-count");
}

export async function getApplicantDashboardOverview(userId: number): Promise<ApplicantDashboardOverview> {
  const [saved, inspections, offers, unread] = await Promise.all([
    listSavedListings(6),
    listInspections(10),
    listOffers(50),
    getUnreadNotificationCount(),
  ]);

  const now = Date.now();
  const upcomingInspections = inspections.items
    .filter((item) => item.slot && item.inspection.status !== "CANCELLED" && item.slot.startsAt)
    .filter((item) => new Date(item.slot!.startsAt).getTime() >= now)
    .sort((left, right) => new Date(left.slot!.startsAt).getTime() - new Date(right.slot!.startsAt).getTime());

  const activeOffers = offers.items
    .filter((item) => item.offer.proposedByUserId === userId)
    .filter((item) => item.offer.status === "PENDING" || item.offer.status === "COUNTERED")
    .sort((left, right) => new Date(right.offer.updatedAt).getTime() - new Date(left.offer.updatedAt).getTime());

  const activities: ActivityItem[] = [
    ...saved.items
      .filter((item) => item.listing)
      .map((item) => ({
        id: `save-${item.save.listingId}-${item.save.savedAt}`,
        title: "Saved a listing",
        description: item.listing?.title ?? "Saved property",
        occurredAt: item.save.savedAt,
        href: `/listings/${item.save.listingId}`,
      })),
    ...inspections.items
      .filter((item) => item.listing)
      .map((item) => ({
        id: `inspection-${item.inspection.id}`,
        title: "Booked an inspection",
        description: item.listing?.title ?? "Inspection booked",
        occurredAt: item.inspection.createdAt,
        href: "/dashboard/inspections",
      })),
    ...offers.items
      .filter((item) => item.listing && item.offer.proposedByUserId === userId)
      .map((item) => ({
        id: `offer-${item.offer.id}`,
        title: "Submitted an offer",
        description: item.listing?.title ?? "Offer submitted",
        occurredAt: item.offer.createdAt,
        href: "/dashboard/offers",
      })),
  ]
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, 5);

  return {
    savedCount: saved.total,
    upcomingInspectionCount: upcomingInspections.length,
    activeOfferCount: activeOffers.length,
    unreadNotificationCount: unread.unread,
    savedPreview: saved.items
      .sort((left, right) => new Date(right.save.savedAt).getTime() - new Date(left.save.savedAt).getTime())
      .slice(0, 3),
    inspectionPreview: upcomingInspections.slice(0, 2),
    offerPreview: activeOffers.slice(0, 3),
    recentActivity: activities,
  };
}

export async function getApplicantProfileData(userId: number) {
  const [privateProfile, publicProfile, reviewsPage, verificationsPage] = await Promise.all([
    api.get<PrivateUserProfile>("/me/profile"),
    api.get<PublicUserProfile>(`/users/${userId}/profile`, { skipAuth: true }),
    api.get<PagedModel<PublicReview>>(`/users/${userId}/reviews`, {
      skipAuth: true,
      query: { page: 0, size: 8 },
    }),
    api.get<PagedModel<VerificationResponse>>("/verifications/mine", {
      query: { page: 0, size: 20 },
    }),
  ]);

  return {
    privateProfile,
    publicProfile,
    reviews: reviewsPage.content,
    latestIdentityVerification:
      verificationsPage.content.find((item) => item.type === "APPLICANT_IDENTITY") ?? null,
  };
}

export async function updateMyProfileBasics(payload: {
  fullName?: string;
  email?: string;
  phone?: string;
  displayName?: string;
}) {
  return api.patch<PrivateUserProfile>("/me", payload);
}

export async function changeMyPassword(payload: { currentPassword: string; newPassword: string }) {
  return api.post<void>("/me/password", payload);
}

export async function markNotificationRead(notificationId: number) {
  return api.post<NotificationResponse>(`/notifications/${notificationId}/mark-read`);
}

export async function markAllNotificationsRead() {
  return api.post<{ marked: number }>("/notifications/mark-all-read");
}

export async function unsaveListing(listingId: number) {
  return api.delete<void>(`/listings/${listingId}/save`);
}

export async function respondToOffer(offerId: number, status: "ACCEPTED" | "DECLINED") {
  return api.patch<OfferResponse>(`/offers/${offerId}`, { status });
}

export async function cancelInspection(inspectionId: number) {
  return api.delete<void>(`/inspections/${inspectionId}`);
}

export async function submitApplicantVerification(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  const upload = await api.post<{ url: string }>("/verifications/files", formData);

  return api.post<VerificationResponse>("/verifications", {
    type: "APPLICANT_IDENTITY",
    documentRefs: {
      kind: "NIN",
      ref: upload.url,
    },
  });
}

export function getNotificationHref(notification: NotificationResponse) {
  const payload = parseNotificationPayload(notification.payload);
  const listingId = typeof payload?.listingId === "number" ? payload.listingId : null;

  if (notification.kind.startsWith("OFFER")) {
    return "/dashboard/offers";
  }
  if (notification.kind.startsWith("INSPECTION")) {
    return "/dashboard/inspections";
  }
  if (notification.kind === "REVIEW_RECEIVED") {
    return "/dashboard/profile";
  }
  if (notification.kind.startsWith("VERIFICATION")) {
    return "/dashboard/profile";
  }
  if (listingId) {
    return `/listings/${listingId}`;
  }
  return "/dashboard/notifications";
}

export function getNotificationPayload(notification: NotificationResponse) {
  return parseNotificationPayload(notification.payload);
}

export function readApplicantProfileDraft(userId: number) {
  return readFromStorage(getStorageKey(PROFILE_DRAFT_STORAGE_KEY, userId), DEFAULT_PROFILE_DRAFT);
}

export function saveApplicantProfileDraft(userId: number, draft: ApplicantProfileDraft) {
  writeToStorage(getStorageKey(PROFILE_DRAFT_STORAGE_KEY, userId), draft);
}

export function readApplicantNotificationPreferences(userId: number) {
  return readFromStorage(
    getStorageKey(NOTIFICATION_PREFS_STORAGE_KEY, userId),
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
}

export function saveApplicantNotificationPreferences(
  userId: number,
  preferences: ApplicantNotificationPreferences,
) {
  writeToStorage(getStorageKey(NOTIFICATION_PREFS_STORAGE_KEY, userId), preferences);
}

export function isUnauthorizedApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.isUnauthorized;
}
