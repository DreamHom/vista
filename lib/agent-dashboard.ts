import { api, ApiError } from "@/lib/api";
import {
  changeMyPassword,
  getNotificationPayload,
  listNotifications,
  updateMyProfileBasics,
  type NotificationResponse,
  type OfferResponse,
  type PagedModel,
  type PrivateUserProfile,
  type VerificationResponse,
} from "@/lib/applicant-dashboard";
import { getListingById, type PublicListingDetail, type PublicReview } from "@/lib/seed/public-data";
import type { WorkspaceInspectionStatusLabel } from "@/lib/inspection-lifecycle";
import { agentHasOperationalAccess } from "@/lib/assignment-lifecycle";
import type { AgentListingResponse } from "@/lib/owner-dashboard";
import type { Role } from "@/lib/types";

function acceptedManagedListings(items: AgentManagedListing[]): AgentManagedListing[] {
  return items.filter((item) => agentHasOperationalAccess(item.assignment.status));
}

export type AgentNotificationFilter =
  | "all"
  | "inspection"
  | "offer"
  | "owner"
  | "verification"
  | "general";

export type PipelineStage = "COLD" | "WARM" | "HOT" | "OFFER_SUBMITTED" | "DEAL_CLOSED";
export type LeadTemperature = "Cold" | "Warm" | "Hot";

export interface PublicUserTrustProfile {
  id: number;
  fullName: string;
  displayName?: string | null;
  role: Role;
  identityVerifiedAt?: string | null;
  agentCredentialVerifiedAt?: string | null;
  suspended?: boolean;
  averageRating?: number | null;
  reviewCount: number;
  closedDealCount?: number | null;
  medianResponseMinutes?: number | null;
  joinedAt?: string | null;
  publicBio?: string | null;
  profileImageUrl?: string | null;
  serviceAreas?: string[] | null;
  languages?: string[] | null;
  specializationTags?: string[] | null;
  feeSchedule?: string | null;
}

export interface AgentManagedListing {
  assignment: AgentListingResponse;
  listing: PublicListingDetail | null;
  ownerProfile: PublicUserTrustProfile | null;
  inspectionRequestCount: number;
  offerActivityCount: number;
  leadCount: number;
}

export interface AgentInspectionDecision {
  status: "pending" | "approved" | "completed" | "cancelled";
  note: string;
  noShow: boolean;
  rescheduleAt: string;
}

export interface AgentInspectionItem {
  key: string;
  notification: NotificationResponse;
  listingId: number | null;
  listing: PublicListingDetail | null;
  applicantName: string;
  requestedAt: string;
  statusLabel: WorkspaceInspectionStatusLabel;
  localStatus: AgentInspectionDecision["status"];
  note: string;
  noShow: boolean;
  rescheduleAt: string;
}

export interface AgentOfferWorkspaceItem {
  key: string;
  offerId: number | null;
  listingId: number | null;
  listing: PublicListingDetail | null;
  applicantName: string;
  amount: number | null;
  status: string;
  source: "offers-api" | "notification";
  summary: string;
  occurredAt: string;
  payload: Record<string, unknown> | null;
  presented: boolean;
  recommendation: string;
  counterDraft: string;
}

export interface AgentLeadItem {
  key: string;
  applicantId: number | null;
  applicantName: string;
  listingId: number | null;
  listing: PublicListingDetail | null;
  lastAction: string;
  lastActionAt: string;
  temperature: LeadTemperature;
  stage: PipelineStage;
  contactDetails: string;
  shortlisted: boolean;
  suspicious: boolean;
}

export interface AgentDashboardOverview {
  activeListings: number;
  inspectionsToday: number;
  openOffers: number;
  dealsClosedThisMonth: number;
  responseRate: number;
  totalRevenueTracked: number;
  todaysInspections: AgentInspectionItem[];
  recentLeads: AgentLeadItem[];
  pendingRequests: AgentManagedListing[];
}

export interface AgentOwnerMessage {
  id: string;
  ownerId: number;
  listingId?: number | null;
  body: string;
  createdAt: string;
}

export interface AgentOwnerRelationship {
  ownerId: number;
  ownerProfile: PublicUserTrustProfile | null;
  listingsManaged: AgentManagedListing[];
  pendingInvites: AgentManagedListing[];
  communicationLog: AgentOwnerMessage[];
}

export interface AgentProfileDraft {
  bio: string;
  specializations: string;
  locations: string;
  feeStructure: string;
  languages: string;
}

export interface AgentNotificationPreferences {
  inspectionRequests: boolean;
  offerActivity: boolean;
  ownerActivity: boolean;
  verificationUpdates: boolean;
  email: boolean;
  inApp: boolean;
}

export interface AgentPromotionRecord {
  id: string;
  type: "PROFILE" | "LISTING";
  listingId?: number;
  title: string;
  durationDays: number;
  cost: number;
  status: "PENDING" | "ACTIVE" | "ENDED" | "REJECTED";
  startedAt: string;
  endsAt: string;
  viewsGenerated: number;
}

const AGENT_PROFILE_DRAFT_KEY = "dreamhomes.agent.profile-draft";
const AGENT_NOTIFICATION_PREFS_KEY = "dreamhomes.agent.notification-prefs";
const AGENT_INSPECTION_STATE_KEY = "dreamhomes.agent.inspections";
const AGENT_LEAD_STATE_KEY = "dreamhomes.agent.leads";
const AGENT_OFFER_STATE_KEY = "dreamhomes.agent.offers";
const AGENT_OWNER_MESSAGES_KEY = "dreamhomes.agent.owner-messages";
const AGENT_ADS_KEY = "dreamhomes.agent.promotions";

export const DEFAULT_AGENT_PROFILE_DRAFT: AgentProfileDraft = {
  bio: "",
  specializations: "",
  locations: "",
  feeStructure: "",
  languages: "",
};

export const DEFAULT_AGENT_NOTIFICATION_PREFERENCES: AgentNotificationPreferences = {
  inspectionRequests: true,
  offerActivity: true,
  ownerActivity: true,
  verificationUpdates: true,
  email: true,
  inApp: true,
};

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

async function getPublicProfile(userId: number) {
  try {
    return await api.get<PublicUserTrustProfile>(`/users/${userId}/profile`, { skipAuth: true });
  } catch {
    return null;
  }
}

async function listAgentAssignmentsRaw(status?: AgentListingResponse["status"]) {
  const response = await api.get<PagedModel<AgentListingResponse>>("/agent-listings/mine", {
    query: { page: 0, size: 100, status },
  });
  return response.content;
}

async function listManagedContext() {
  const [allAssignments, notifications] = await Promise.all([
    listAgentAssignmentsRaw(),
    listNotifications({ size: 100 }),
  ]);

  const listingIds = [...new Set(allAssignments.map((item) => item.listingId))];
  const listingEntries = await Promise.all(
    listingIds.map(async (listingId) => [listingId, (await getListingById(String(listingId))) ?? null] as const),
  );
  const listingMap = new Map<number, PublicListingDetail | null>(listingEntries);

  const ownerIds = [
    ...new Set(
      allAssignments
        .map((assignment) => listingMap.get(assignment.listingId)?.owner?.id)
        .filter((value): value is string => Boolean(value))
        .map(Number),
    ),
  ];
  const ownerEntries = await Promise.all(ownerIds.map(async (ownerId) => [ownerId, await getPublicProfile(ownerId)] as const));
  const ownerMap = new Map<number, PublicUserTrustProfile | null>(ownerEntries);

  const managedListings: AgentManagedListing[] = allAssignments.map((assignment) => {
    const listing = listingMap.get(assignment.listingId) ?? null;
    const payloadMatchesListing = notifications.items.filter((notification) => {
      const payload = getNotificationPayload(notification);
      return readNumeric(payload?.listingId) === assignment.listingId;
    });

    return {
      assignment,
      listing,
      ownerProfile:
        listing?.owner?.id && !Number.isNaN(Number(listing.owner.id))
          ? ownerMap.get(Number(listing.owner.id)) ?? null
          : null,
      inspectionRequestCount: payloadMatchesListing.filter((item) => item.kind === "INSPECTION_REQUESTED").length,
      offerActivityCount: payloadMatchesListing.filter((item) => item.kind.startsWith("OFFER")).length,
      leadCount: (listing?.comments?.length ?? 0) + payloadMatchesListing.filter((item) => item.kind === "INSPECTION_REQUESTED").length,
    };
  });

  return {
    assignments: allAssignments,
    managedListings,
    notifications: notifications.items,
  };
}

function readNumeric(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function migrateAgentInspectionDecision(
  decision: AgentInspectionDecision & { status?: string },
): AgentInspectionDecision {
  const rawStatus = decision.status as string;
  const status: AgentInspectionDecision["status"] =
    rawStatus === "confirmed" ? "approved" : (decision.status as AgentInspectionDecision["status"]);
  return { ...decision, status };
}

function getInspectionStorage(userId: number) {
  const raw = readFromStorage<Record<string, AgentInspectionDecision & { status?: string }>>(
    storageKey(AGENT_INSPECTION_STATE_KEY, userId),
    {},
  );
  const migrated: Record<string, AgentInspectionDecision> = {};
  for (const [key, value] of Object.entries(raw)) {
    migrated[key] = migrateAgentInspectionDecision(value);
  }
  return migrated;
}

function getLeadStorage(userId: number) {
  return readFromStorage<
    Record<
      string,
      {
        stage: PipelineStage;
        shortlisted: boolean;
        suspicious: boolean;
      }
    >
  >(storageKey(AGENT_LEAD_STATE_KEY, userId), {});
}

function getOfferStorage(userId: number) {
  return readFromStorage<
    Record<
      string,
      {
        presented: boolean;
        recommendation: string;
        counterDraft: string;
      }
    >
  >(storageKey(AGENT_OFFER_STATE_KEY, userId), {});
}

function getOwnerMessages(userId: number) {
  return readFromStorage<AgentOwnerMessage[]>(storageKey(AGENT_OWNER_MESSAGES_KEY, userId), []);
}

function buildInspectionStatus(state: AgentInspectionDecision): AgentInspectionItem["statusLabel"] {
  if (state.noShow) return "No-show";
  switch (state.status) {
    case "approved":
      return "Approved";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function inferTemperature(source: string): LeadTemperature {
  if (source.includes("offer")) return "Hot";
  if (source.includes("inspection")) return "Warm";
  return "Cold";
}

function inferPipelineStage(source: string): PipelineStage {
  if (source.includes("accepted")) return "DEAL_CLOSED";
  if (source.includes("offer")) return "OFFER_SUBMITTED";
  if (source.includes("inspection")) return "HOT";
  return "WARM";
}

function normalizeNotifications(items: NotificationResponse[], filter: AgentNotificationFilter) {
  return items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "inspection") return item.kind.startsWith("INSPECTION");
    if (filter === "offer") return item.kind.startsWith("OFFER");
    if (filter === "owner") return item.kind.startsWith("AGENT_ASSIGNMENT") || item.kind === "COMMENT_POSTED";
    if (filter === "verification") return item.kind.startsWith("VERIFICATION");
    return !item.kind.startsWith("OFFER") && !item.kind.startsWith("INSPECTION");
  });
}

function syntheticOfferStatus(kind: NotificationResponse["kind"]) {
  if (kind === "OFFER_COUNTERED") return "COUNTERED";
  if (kind === "OFFER_AUTO_DECLINED") return "DECLINED";
  if (kind === "OFFER_SUBMITTED") return "PENDING";
  return kind;
}

async function listAgentOfferItems(managedListings: AgentManagedListing[], userId: number) {
  const offerStorage = getOfferStorage(userId);
  const listingIds = new Set(managedListings.map((item) => item.assignment.listingId));
  const listingMap = new Map(managedListings.map((item) => [item.assignment.listingId, item.listing] as const));

  let apiOffers: OfferResponse[] = [];
  try {
    const response = await api.get<PagedModel<OfferResponse>>("/offers/mine", {
      query: { page: 0, size: 100 },
    });
    apiOffers = response.content.filter((item) => listingIds.has(item.listingId));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) {
      apiOffers = [];
    }
  }

  if (apiOffers.length > 0) {
    return apiOffers.map((offer) => {
      const local = offerStorage[`offer-${offer.id}`] ?? {
        presented: false,
        recommendation: "",
        counterDraft: "",
      };

      return {
        key: `offer-${offer.id}`,
        offerId: offer.id,
        listingId: offer.listingId,
        listing: listingMap.get(offer.listingId) ?? null,
        applicantName: `Applicant #${offer.applicantId}`,
        amount: offer.amount,
        status: offer.status,
        source: "offers-api" as const,
        summary: offer.message ?? "Offer activity synced from Haven.",
        occurredAt: offer.updatedAt,
        payload: null,
        presented: local.presented,
        recommendation: local.recommendation,
        counterDraft: local.counterDraft,
      };
    });
  }

  const notifications = await listNotifications({ size: 100 });
  return notifications.items
    .filter((notification) => notification.kind.startsWith("OFFER"))
    .map((notification) => {
      const payload = getNotificationPayload(notification);
      const listingId = readNumeric(payload?.listingId);
      const applicantId = readNumeric(payload?.applicantId);
      const amount = readNumeric(payload?.amount);
      const key = `notification-${notification.id}`;
      const local = offerStorage[key] ?? {
        presented: false,
        recommendation: "",
        counterDraft: "",
      };

      return {
        key,
        offerId: readNumeric(payload?.offerId),
        listingId,
        listing: listingId ? (listingMap.get(listingId) ?? null) : null,
        applicantName: applicantId ? `Applicant #${applicantId}` : "Applicant",
        amount,
        status: syntheticOfferStatus(notification.kind),
        source: "notification" as const,
        summary: notification.body ?? "Offer activity received in the agent inbox.",
        occurredAt: notification.createdAt,
        payload,
        presented: local.presented,
        recommendation: local.recommendation,
        counterDraft: local.counterDraft,
      };
    })
    .filter((item) => (item.listingId ? listingIds.has(item.listingId) : true));
}

export async function getAgentDashboardOverview(userId: number): Promise<AgentDashboardOverview> {
  const [{ assignments, managedListings }, reviewsPage] = await Promise.all([
    listManagedContext(),
    api
      .get<PagedModel<PublicReview>>(`/users/${userId}/reviews`, { skipAuth: true, query: { page: 0, size: 20 } })
      .catch(() => ({ content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } })),
  ]);

  const inspections = await listAgentInspections(userId);
  const offers = await listAgentOffers(userId);
  const leads = await listAgentLeads(userId);

  const accepted = managedListings.filter((item) => item.assignment.status === "ACCEPTED");
  const pendingRequests = managedListings.filter((item) => item.assignment.status === "REQUESTED");
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const revenueTracked = offers.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const decidedRequests = assignments.filter((item) => item.status !== "REQUESTED").length;
  const responseRate = assignments.length === 0 ? 100 : Math.round((decidedRequests / assignments.length) * 100);
  const dealsClosedThisMonth = offers.filter((item) => {
    const date = new Date(item.occurredAt);
    return item.status === "ACCEPTED" && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;

  const inspectionsToday = inspections.filter((item) => new Date(item.requestedAt).toDateString() === today).length;

  const reviewBoost = reviewsPage.content.filter((item) => item.rating >= 4).length;

  return {
    activeListings: accepted.length,
    inspectionsToday,
    openOffers: offers.filter((item) => !["DECLINED", "WITHDRAWN"].includes(item.status)).length,
    dealsClosedThisMonth,
    responseRate,
    totalRevenueTracked: revenueTracked + reviewBoost * 250000,
    todaysInspections: inspections.slice(0, 4),
    recentLeads: leads.slice(0, 4),
    pendingRequests,
  };
}

export async function listAgentManagedListings() {
  const { managedListings } = await listManagedContext();
  return managedListings;
}

export async function getAgentListingWorkspace(listingId: number, userId: number) {
  const managedListings = await listAgentManagedListings();
  const target = managedListings.find((item) => item.assignment.listingId === listingId) ?? null;
  const operational = target != null && agentHasOperationalAccess(target.assignment.status);
  const offers = operational
    ? (await listAgentOffers(userId)).filter((item) => item.listingId === listingId)
    : [];
  const leads = operational
    ? (await listAgentLeads(userId)).filter((item) => item.listingId === listingId)
    : [];
  const ownerMessages = operational
    ? getOwnerMessages(userId).filter((item) => item.listingId === listingId)
    : [];

  return {
    managedListing: target,
    operational,
    offers,
    leads,
    ownerMessages,
  };
}

export async function listAgentInspections(userId: number) {
  const { managedListings, notifications } = await listManagedContext();
  const active = acceptedManagedListings(managedListings);
  const acceptedListingIds = new Set(active.map((item) => item.assignment.listingId));
  const inspectionState = getInspectionStorage(userId);
  const managedListingMap = new Map(active.map((item) => [item.assignment.listingId, item.listing] as const));

  return notifications
    .filter((notification) => notification.kind === "INSPECTION_REQUESTED")
    .map((notification) => {
      const payload = getNotificationPayload(notification);
      const listingId = readNumeric(payload?.listingId);
      if (listingId != null && !acceptedListingIds.has(listingId)) return null;
      const state = inspectionState[String(notification.id)] ?? {
        status: "pending" as const,
        note: "",
        noShow: false,
        rescheduleAt: "",
      };

      return {
        key: `inspection-${notification.id}`,
        notification,
        listingId,
        listing: listingId ? (managedListingMap.get(listingId) ?? null) : null,
        applicantName: readString(payload?.applicantName, `Applicant #${readNumeric(payload?.applicantId) ?? "TBD"}`),
        requestedAt: notification.createdAt,
        statusLabel: buildInspectionStatus(state),
        localStatus: state.status,
        note: state.note,
        noShow: state.noShow,
        rescheduleAt: state.rescheduleAt,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((left, right) => new Date(left.requestedAt).getTime() - new Date(right.requestedAt).getTime());
}

export async function listAgentLeads(userId: number) {
  const managedListings = acceptedManagedListings(await listAgentManagedListings());
  const leadState = getLeadStorage(userId);

  const commentLeads = managedListings.flatMap((managed) =>
    (managed.listing?.comments ?? []).map((comment) => {
      const stored = leadState[`comment-${comment.id}`];
      return {
        key: `comment-${comment.id}`,
        applicantId: null,
        applicantName: comment.authorName,
        listingId: managed.assignment.listingId,
        listing: managed.listing,
        lastAction: "Commented on the listing",
        lastActionAt: comment.date,
        temperature: inferTemperature("comment"),
        stage: stored?.stage ?? inferPipelineStage("comment"),
        contactDetails: "Contact details become available after a secure owner-approved intro.",
        shortlisted: stored?.shortlisted ?? false,
        suspicious: stored?.suspicious ?? false,
      };
    }),
  );

  const inspectionLeads = (await listAgentInspections(userId)).map((inspection) => {
    const stored = leadState[inspection.key];
    return {
      key: inspection.key,
      applicantId: null,
      applicantName: inspection.applicantName,
      listingId: inspection.listingId,
      listing: inspection.listing,
      lastAction: inspection.localStatus === "completed" ? "Inspection completed" : "Requested an inspection",
      lastActionAt: inspection.requestedAt,
      temperature: inferTemperature("inspection"),
      stage: stored?.stage ?? inferPipelineStage("inspection"),
      contactDetails: "Secure contact handoff is not exposed to the agent API yet.",
      shortlisted: stored?.shortlisted ?? false,
      suspicious: stored?.suspicious ?? false,
    };
  });

  const offerLeads = (await listAgentOffers(userId)).map((offer) => {
    const stored = leadState[offer.key];
    return {
      key: offer.key,
      applicantId: null,
      applicantName: offer.applicantName,
      listingId: offer.listingId,
      listing: offer.listing,
      lastAction: offer.status === "ACCEPTED" ? "Offer accepted" : "Offer activity received",
      lastActionAt: offer.occurredAt,
      temperature: inferTemperature("offer"),
      stage: stored?.stage ?? (offer.status === "ACCEPTED" ? "DEAL_CLOSED" : "OFFER_SUBMITTED"),
      contactDetails: "Applicant contact detail is hidden until the owner approves the next step.",
      shortlisted: stored?.shortlisted ?? false,
      suspicious: stored?.suspicious ?? false,
    };
  });

  return [...commentLeads, ...inspectionLeads, ...offerLeads].sort(
    (left, right) => new Date(right.lastActionAt).getTime() - new Date(left.lastActionAt).getTime(),
  );
}

export async function listAgentOffers(userId: number) {
  const managedListings = acceptedManagedListings(await listAgentManagedListings());
  const items = await listAgentOfferItems(managedListings, userId);
  return items.sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());
}

export async function listAgentOwnerRelationships(userId: number) {
  const managedListings = await listAgentManagedListings();
  const grouped = new Map<number, AgentOwnerRelationship>();
  const messages = getOwnerMessages(userId);

  for (const listing of managedListings) {
    const ownerId = Number(listing.listing?.owner?.id ?? listing.ownerProfile?.id ?? 0);
    if (!ownerId) continue;

    const existing = grouped.get(ownerId) ?? {
      ownerId,
      ownerProfile: listing.ownerProfile,
      listingsManaged: [],
      pendingInvites: [],
      communicationLog: messages.filter((item) => item.ownerId === ownerId),
    };

    if (listing.assignment.status === "REQUESTED") {
      existing.pendingInvites.push(listing);
    } else if (agentHasOperationalAccess(listing.assignment.status)) {
      existing.listingsManaged.push(listing);
    }

    grouped.set(ownerId, existing);
  }

  return [...grouped.values()].sort((left, right) => left.ownerId - right.ownerId);
}

export async function getAgentProfileWorkspace(userId: number) {
  const [privateProfile, publicProfile, reviewsPage, verificationsPage] = await Promise.all([
    api.get<PrivateUserProfile>("/me/profile"),
    api.get<PublicUserTrustProfile>(`/users/${userId}/profile`, { skipAuth: true }),
    api.get<PagedModel<PublicReview>>(`/users/${userId}/reviews`, {
      skipAuth: true,
      query: { page: 0, size: 20 },
    }),
    api.get<PagedModel<VerificationResponse>>("/verifications/mine", {
      query: { page: 0, size: 20 },
    }),
  ]);

  return {
    privateProfile,
    publicProfile,
    reviews: reviewsPage.content,
    latestCredentialVerification:
      verificationsPage.content.find((item) => item.type === "AGENT_CREDENTIALS") ?? null,
    latestIdentityVerification:
      verificationsPage.content.find((item) => item.type === "OWNER_IDENTITY" || item.type === "APPLICANT_IDENTITY") ??
      null,
  };
}

export async function listAgentNotifications(filter: AgentNotificationFilter = "all") {
  const notifications = await listNotifications({ size: 100 });
  return normalizeNotifications(notifications.items, filter);
}

export function readAgentProfileDraft(userId: number) {
  return readFromStorage(storageKey(AGENT_PROFILE_DRAFT_KEY, userId), DEFAULT_AGENT_PROFILE_DRAFT);
}

export function saveAgentProfileDraft(userId: number, draft: AgentProfileDraft) {
  writeToStorage(storageKey(AGENT_PROFILE_DRAFT_KEY, userId), draft);
}

export function readAgentNotificationPreferences(userId: number) {
  return readFromStorage(
    storageKey(AGENT_NOTIFICATION_PREFS_KEY, userId),
    DEFAULT_AGENT_NOTIFICATION_PREFERENCES,
  );
}

export function saveAgentNotificationPreferences(userId: number, preferences: AgentNotificationPreferences) {
  writeToStorage(storageKey(AGENT_NOTIFICATION_PREFS_KEY, userId), preferences);
}

export function saveAgentInspectionDecision(userId: number, notificationId: number, decision: AgentInspectionDecision) {
  const current = getInspectionStorage(userId);
  current[String(notificationId)] = decision;
  writeToStorage(storageKey(AGENT_INSPECTION_STATE_KEY, userId), current);
}

export function saveAgentLeadState(
  userId: number,
  leadKey: string,
  state: { stage: PipelineStage; shortlisted: boolean; suspicious: boolean },
) {
  const current = getLeadStorage(userId);
  current[leadKey] = state;
  writeToStorage(storageKey(AGENT_LEAD_STATE_KEY, userId), current);
}

export function saveAgentOfferState(
  userId: number,
  offerKey: string,
  state: { presented: boolean; recommendation: string; counterDraft: string },
) {
  const current = getOfferStorage(userId);
  current[offerKey] = state;
  writeToStorage(storageKey(AGENT_OFFER_STATE_KEY, userId), current);
}

export function appendAgentOwnerMessage(
  userId: number,
  message: Omit<AgentOwnerMessage, "id" | "createdAt"> & { createdAt?: string },
) {
  const current = getOwnerMessages(userId);
  current.unshift({
    ...message,
    id: `${message.ownerId}-${Date.now()}`,
    createdAt: message.createdAt ?? new Date().toISOString(),
  });
  writeToStorage(storageKey(AGENT_OWNER_MESSAGES_KEY, userId), current);
}

export function readAgentPromotions(userId: number) {
  return readFromStorage<AgentPromotionRecord[]>(storageKey(AGENT_ADS_KEY, userId), []);
}

export function saveAgentPromotions(userId: number, promotions: AgentPromotionRecord[]) {
  writeToStorage(storageKey(AGENT_ADS_KEY, userId), promotions);
}

export async function acceptAgentAssignment(assignmentId: number) {
  return api.post<AgentListingResponse>(`/agent-listings/${assignmentId}/accept`);
}

export async function declineAgentAssignment(assignmentId: number, reason: string) {
  return api.post<AgentListingResponse>(`/agent-listings/${assignmentId}/decline`, { reason });
}

export async function updateAgentProfile(payload: {
  fullName?: string;
  email?: string;
  phone?: string;
  displayName?: string;
  licenseNumber?: string;
  agency?: string;
  publicBio?: string;
  specializationTags?: string[];
  serviceAreas?: string[];
  languages?: string[];
  feeSchedule?: string | null;
}) {
  const basics: Parameters<typeof updateMyProfileBasics>[0] = {};
  if (payload.fullName !== undefined) basics.fullName = payload.fullName;
  if (payload.email !== undefined) basics.email = payload.email;
  if (payload.phone !== undefined) basics.phone = payload.phone;
  if (payload.displayName !== undefined) basics.displayName = payload.displayName;
  if (payload.publicBio !== undefined) basics.publicBio = payload.publicBio;

  const agentPatch: Record<string, unknown> = {};
  if (payload.licenseNumber !== undefined) agentPatch.licenseNumber = payload.licenseNumber;
  if (payload.agency !== undefined) agentPatch.agency = payload.agency;
  if (payload.specializationTags !== undefined) agentPatch.specializationTags = payload.specializationTags;
  if (payload.serviceAreas !== undefined) agentPatch.serviceAreas = payload.serviceAreas;
  if (payload.languages !== undefined) agentPatch.languages = payload.languages;
  if (payload.feeSchedule !== undefined) agentPatch.feeSchedule = payload.feeSchedule;

  if (Object.keys(basics).length) {
    await updateMyProfileBasics(basics);
  }
  if (Object.keys(agentPatch).length) {
    await api.patch<PrivateUserProfile>("/me/agent-profile", agentPatch);
  }

  return api.get<PrivateUserProfile>("/me/profile");
}

export async function changeAgentPassword(payload: { currentPassword: string; newPassword: string }) {
  return changeMyPassword(payload);
}
