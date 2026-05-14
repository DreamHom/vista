import { api } from "@/lib/api";
import { getDreamAiInventory, type PublicReview } from "@/lib/seed/public-data";
import type { PagedModel } from "@/lib/applicant-dashboard";
import type { Role } from "@/lib/types";

export type VerificationQueueType =
  | "OWNER_IDENTITY"
  | "PROPERTY_DOCUMENTS"
  | "AGENT_CREDENTIALS"
  | "APPLICANT_IDENTITY";

export interface VerificationAdminView {
  id: number;
  type: VerificationQueueType;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitterUserId: number;
  targetUserId?: number | null;
  targetPropertyId?: number | null;
  documentRefs?: string | null;
  submittedAt: string;
  decidedAt?: string | null;
  decidedByAdminId?: number | null;
  decisionReason?: string | null;
}

export interface UserAdminView {
  id: number;
  email: string;
  displayName?: string | null;
  fullName?: string | null;
  role: Role;
  suspendedAt?: string | null;
  identityVerifiedAt?: string | null;
}

export interface AdminListingReportResponse {
  id: number;
  listingId: number;
  reporterUserId: number;
  reason: "SCAM" | "OFF_PLATFORM_FEES" | "STALE_OR_TAKEN" | "INAPPROPRIATE_CONTENT" | "OTHER";
  details?: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  resolutionNote?: string | null;
  resolvedByAdminId?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AdminAuditLogResponse {
  id: number;
  adminId: number;
  action:
    | "VERIFICATION_APPROVED"
    | "VERIFICATION_REJECTED"
    | "LISTING_APPROVED"
    | "LISTING_TAKEDOWN"
    | "USER_SUSPENDED"
    | "USER_REACTIVATED"
    | "REVIEW_TAKEDOWN";
  targetType: "VERIFICATION" | "LISTING" | "USER" | "REVIEW";
  targetId: number;
  metadata?: string | null;
  createdAt: string;
}

export interface AnalyticsSummaryResponse {
  totalUsers: number;
  suspendedUsers: number;
  openListings: number;
  closedListings: number;
  pendingVerifications: number;
  pendingOffers: number;
}

export interface AdminUserProfile {
  id: number;
  fullName: string;
  displayName?: string | null;
  role: Role;
  identityVerifiedAt?: string | null;
  agentCredentialVerifiedAt?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  closedDealCount?: number | null;
  medianResponseMinutes?: number | null;
  joinedAt?: string | null;
  suspended?: boolean;
}

export interface AdminDashboardOverview {
  summary: AnalyticsSummaryResponse;
  roleCounts: Record<Role, number>;
  verificationSummary: Array<{ type: VerificationQueueType; count: number }>;
  recentActivity: AdminAuditLogResponse[];
  alerts: Array<{ id: string; title: string; body: string; href: string }>;
}

export interface AdminListingRow {
  listingId: number;
  title: string;
  address: string;
  ownerName: string;
  agentName: string;
  status: "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN";
  createdAt: string;
  reportCount: number;
  source: "inventory" | "audit";
}

export interface ModerationCommentItem {
  key: string;
  commentId: string;
  listingId: number;
  listingTitle: string;
  listingAddress: string;
  author: string;
  body: string;
  flaggedAt: string;
  flagReason: string;
}

export interface AdminAdsState {
  featuredAgentDailyRate: number;
  featuredListingDailyRate: number;
  pendingRequests: Array<{
    id: string;
    type: "PROFILE" | "LISTING";
    title: string;
    durationDays: number;
    requester: string;
    cost: number;
    createdAt: string;
  }>;
  activePromotions: Array<{
    id: string;
    type: "PROFILE" | "LISTING";
    title: string;
    durationDays: number;
    cost: number;
    status: "ACTIVE" | "ENDED";
    createdAt: string;
    endsAt: string;
    views: number;
  }>;
}

export interface AdminPlatformSettings {
  ownerIdentityRequired: boolean;
  propertyDocumentsRequired: boolean;
  agentCredentialsRequired: boolean;
  defaultCommissionRate: number;
  ownerResponseSlaHours: number;
  inspectionConflictBufferMinutes: number;
}

const ADMIN_COMMENT_FLAGS_KEY = "dreamhomes.admin.comment-flags";
const ADMIN_ADS_KEY = "dreamhomes.admin.ads";
const ADMIN_SETTINGS_KEY = "dreamhomes.admin.settings";

export const DEFAULT_ADMIN_ADS_STATE: AdminAdsState = {
  featuredAgentDailyRate: 35000,
  featuredListingDailyRate: 50000,
  pendingRequests: [],
  activePromotions: [],
};

export const DEFAULT_ADMIN_PLATFORM_SETTINGS: AdminPlatformSettings = {
  ownerIdentityRequired: true,
  propertyDocumentsRequired: true,
  agentCredentialsRequired: true,
  defaultCommissionRate: 7.5,
  ownerResponseSlaHours: 24,
  inspectionConflictBufferMinutes: 30,
};

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
    return await api.get<AdminUserProfile>(`/users/${userId}/profile`, { skipAuth: true });
  } catch {
    return null;
  }
}

export async function listAdminVerifications(options: {
  type?: VerificationQueueType;
  status?: VerificationAdminView["status"];
  size?: number;
}) {
  const response = await api.get<PagedModel<VerificationAdminView>>("/admin/verifications", {
    query: {
      type: options.type,
      status: options.status,
      page: 0,
      size: options.size ?? 40,
    },
  });

  return {
    items: response.content,
    total: response.page?.totalElements ?? response.content.length,
  };
}

export async function listAdminUsers(options: {
  email?: string;
  role?: Role;
  suspended?: boolean;
  size?: number;
}) {
  const response = await api.get<PagedModel<UserAdminView>>("/admin/users", {
    query: {
      email: options.email,
      role: options.role,
      suspended: options.suspended,
      page: 0,
      size: options.size ?? 100,
    },
  });

  const profiles = await Promise.all(response.content.map((item) => getPublicProfile(item.id)));
  const profileMap = new Map(response.content.map((item, index) => [item.id, profiles[index]] as const));

  return {
    items: response.content.map((item) => ({
      ...item,
      fullName: profileMap.get(item.id)?.fullName ?? item.displayName ?? item.email,
      joinedAt: profileMap.get(item.id)?.joinedAt ?? null,
      agentCredentialVerifiedAt: profileMap.get(item.id)?.agentCredentialVerifiedAt ?? null,
      averageRating: profileMap.get(item.id)?.averageRating ?? null,
      reviewCount: profileMap.get(item.id)?.reviewCount ?? 0,
    })),
    total: response.page?.totalElements ?? response.content.length,
  };
}

export async function listAdminReports(options: {
  status?: AdminListingReportResponse["status"];
  reason?: AdminListingReportResponse["reason"];
  listingId?: number;
}) {
  const response = await api.get<PagedModel<AdminListingReportResponse>>("/admin/listing-reports", {
    query: {
      status: options.status,
      reason: options.reason,
      listingId: options.listingId,
      page: 0,
      size: 100,
    },
  });

  return {
    items: response.content,
    total: response.page?.totalElements ?? response.content.length,
  };
}

export async function listAdminAuditLogs(options: {
  actorId?: number;
  action?: AdminAuditLogResponse["action"];
  targetType?: AdminAuditLogResponse["targetType"];
  targetId?: number;
  from?: string;
  to?: string;
}) {
  const response = await api.get<PagedModel<AdminAuditLogResponse>>("/admin/audit-logs", {
    query: {
      actorId: options.actorId,
      action: options.action,
      targetType: options.targetType,
      targetId: options.targetId,
      from: options.from,
      to: options.to,
      page: 0,
      size: 100,
    },
  });

  return {
    items: response.content,
    total: response.page?.totalElements ?? response.content.length,
  };
}

export async function getAdminAnalyticsSummary() {
  return api.get<AnalyticsSummaryResponse>("/admin/analytics/summary");
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const [summary, users, reports, activity, verificationSummary] = await Promise.all([
    getAdminAnalyticsSummary(),
    listAdminUsers({ size: 200 }),
    listAdminReports({ status: "PENDING" }),
    listAdminAuditLogs({}),
    Promise.all(
      (["OWNER_IDENTITY", "PROPERTY_DOCUMENTS", "AGENT_CREDENTIALS", "APPLICANT_IDENTITY"] as VerificationQueueType[]).map(
        async (type) => {
          const result = await listAdminVerifications({ type, status: "PENDING", size: 1 });
          return { type, count: result.total };
        },
      ),
    ),
  ]);

  const roleCounts: Record<Role, number> = {
    OWNER: 0,
    AGENT: 0,
    APPLICANT: 0,
    ADMIN: 0,
  };

  users.items.forEach((user) => {
    roleCounts[user.role] += 1;
  });

  const alerts = [
    ...reports.items.slice(0, 3).map((report) => ({
      id: `report-${report.id}`,
      title: "Reported listing requires review",
      body: `Listing #${report.listingId} was reported for ${report.reason.replaceAll("_", " ").toLowerCase()}.`,
      href: "/admin/reports",
    })),
    ...users.items
      .filter((user) => Boolean(user.suspendedAt))
      .slice(0, 2)
      .map((user) => ({
        id: `user-${user.id}`,
        title: "Suspended user on platform",
        body: `${user.fullName} is currently suspended and should be reviewed before reactivation.`,
        href: "/admin/users",
      })),
  ].slice(0, 5);

  return {
    summary,
    roleCounts,
    verificationSummary,
    recentActivity: activity.items.slice(0, 8),
    alerts,
  };
}

export async function listAdminListings() {
  const [inventory, reports, audit] = await Promise.all([
    getDreamAiInventory(80),
    listAdminReports({}),
    listAdminAuditLogs({ targetType: "LISTING" }),
  ]);

  const reportCountByListing = new Map<number, number>();
  reports.items.forEach((report) => {
    reportCountByListing.set(report.listingId, (reportCountByListing.get(report.listingId) ?? 0) + 1);
  });

  const liveRows: AdminListingRow[] = inventory.map((listing) => ({
    listingId: Number(listing.id),
    title: listing.title,
    address: listing.address,
    ownerName: listing.owner.name,
    agentName: listing.agent?.name ?? "Unassigned",
    status: listing.status,
    createdAt: listing.publishedAt,
    reportCount: reportCountByListing.get(Number(listing.id)) ?? 0,
    source: "inventory",
  }));

  const knownIds = new Set(liveRows.map((row) => row.listingId));
  const auditRows: AdminListingRow[] = audit.items
    .filter((item) => item.action === "LISTING_TAKEDOWN" || item.action === "LISTING_APPROVED")
    .filter((item) => !knownIds.has(item.targetId))
    .map((item) => ({
      listingId: item.targetId,
      title: `Listing #${item.targetId}`,
      address: "Current admin listing detail is unavailable for taken-down inventory in Haven v1.0.1.",
      ownerName: "Unavailable",
      agentName: "Unavailable",
      status: item.action === "LISTING_TAKEDOWN" ? "TAKEN_DOWN" : "LIVE",
      createdAt: item.createdAt,
      reportCount: reportCountByListing.get(item.targetId) ?? 0,
      source: "audit",
    }));

  return [...liveRows, ...auditRows].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function readAdminCommentFlags() {
  return readFromStorage<Record<string, { reason: string; flaggedAt: string }>>(ADMIN_COMMENT_FLAGS_KEY, {});
}

export function saveAdminCommentFlag(commentKey: string, reason: string) {
  const current = readAdminCommentFlags();
  current[commentKey] = {
    reason,
    flaggedAt: new Date().toISOString(),
  };
  writeToStorage(ADMIN_COMMENT_FLAGS_KEY, current);
}

export function clearAdminCommentFlag(commentKey: string) {
  const current = readAdminCommentFlags();
  delete current[commentKey];
  writeToStorage(ADMIN_COMMENT_FLAGS_KEY, current);
}

export async function listAdminModerationComments() {
  const [inventory, reports] = await Promise.all([getDreamAiInventory(40), listAdminReports({})]);
  const flags = readAdminCommentFlags();
  const reportedListingIds = new Set(reports.items.map((report) => report.listingId));

  const seeded = inventory.flatMap((listing) =>
    listing.comments
      .filter((comment, index) => reportedListingIds.has(Number(listing.id)) || index === 0)
      .map((comment) => ({
        key: `${listing.id}-${comment.id}`,
        commentId: comment.id,
        listingId: Number(listing.id),
        listingTitle: listing.title,
        listingAddress: listing.address,
        author: comment.authorName,
        body: comment.body,
        flaggedAt: flags[`${listing.id}-${comment.id}`]?.flaggedAt ?? comment.date,
        flagReason:
          flags[`${listing.id}-${comment.id}`]?.reason ??
          (reportedListingIds.has(Number(listing.id)) ? "Linked to a reported listing." : "Prototype moderation seed."),
      })),
  );

  return seeded.sort((left, right) => new Date(right.flaggedAt).getTime() - new Date(left.flaggedAt).getTime());
}

export async function getAdminAnalyticsWorkspace() {
  const [summary, inventory, agents] = await Promise.all([
    getAdminAnalyticsSummary(),
    getDreamAiInventory(100),
    listAdminUsers({ role: "AGENT", size: 100 }),
  ]);

  const hotspots = Object.entries(
    inventory.reduce<Record<string, { listings: number; avgPrice: number }>>((accumulator, listing) => {
      const location = listing.address.split(",").slice(-2).join(",").trim() || listing.location;
      const existing = accumulator[location] ?? { listings: 0, avgPrice: 0 };
      existing.listings += 1;
      existing.avgPrice += listing.priceNgn;
      accumulator[location] = existing;
      return accumulator;
    }, {}),
  ).map(([location, stats]) => ({
    location,
    listings: stats.listings,
    averagePrice: Math.round(stats.avgPrice / Math.max(1, stats.listings)),
  }));

  const priceTrends = hotspots.sort((left, right) => right.averagePrice - left.averagePrice).slice(0, 6);

  const agentPerformance = await Promise.all(
    agents.items.slice(0, 12).map(async (agent) => {
      const profile = await getPublicProfile(agent.id);
      const reviews = await api
        .get<PagedModel<PublicReview>>(`/users/${agent.id}/reviews`, {
          skipAuth: true,
          query: { page: 0, size: 12 },
        })
        .catch(() => ({ content: [], page: { size: 12, number: 0, totalElements: 0, totalPages: 0 } }));

      return {
        id: agent.id,
        name: profile?.fullName ?? agent.fullName ?? agent.email,
        dealsClosed: profile?.closedDealCount ?? 0,
        responseRate: profile?.medianResponseMinutes ? Math.max(35, 100 - profile.medianResponseMinutes / 2) : 78,
        rating: profile?.averageRating ?? 0,
        reviewCount: reviews.content.length,
      };
    }),
  );

  return {
    summary,
    hotspots: hotspots.sort((left, right) => right.listings - left.listings).slice(0, 6),
    priceTrends,
    agentPerformance: agentPerformance.sort((left, right) => right.dealsClosed - left.dealsClosed),
  };
}

export function readAdminAdsState() {
  return readFromStorage(ADMIN_ADS_KEY, DEFAULT_ADMIN_ADS_STATE);
}

export function saveAdminAdsState(state: AdminAdsState) {
  writeToStorage(ADMIN_ADS_KEY, state);
}

export function readAdminPlatformSettings() {
  return readFromStorage(ADMIN_SETTINGS_KEY, DEFAULT_ADMIN_PLATFORM_SETTINGS);
}

export function saveAdminPlatformSettings(settings: AdminPlatformSettings) {
  writeToStorage(ADMIN_SETTINGS_KEY, settings);
}

export async function approveVerification(verificationId: number) {
  return api.post<VerificationAdminView>(`/admin/verifications/${verificationId}/approve`);
}

export async function rejectVerification(verificationId: number, reason: string) {
  return api.post<VerificationAdminView>(`/admin/verifications/${verificationId}/reject`, { reason });
}

export async function suspendUser(userId: number, reason: string) {
  return api.post<UserAdminView>(`/admin/users/${userId}/suspend`, { reason });
}

export async function reactivateUser(userId: number, reason: string) {
  return api.post<UserAdminView>(`/admin/users/${userId}/reactivate`, { reason });
}

export async function takeDownListing(listingId: number, reason: string) {
  return api.post(`/admin/listings/${listingId}/takedown`, { reason });
}

export async function approveListing(listingId: number, reason?: string) {
  return api.post(`/admin/listings/${listingId}/approve`, reason ? { reason } : {});
}

export async function resolveListingReport(reportId: number, note: string) {
  return api.post<AdminListingReportResponse>(`/admin/listing-reports/${reportId}/resolve`, { note });
}

export async function dismissListingReport(reportId: number, note: string) {
  return api.post<AdminListingReportResponse>(`/admin/listing-reports/${reportId}/dismiss`, { note });
}

export async function deleteComment(commentId: string) {
  return api.delete<void>(`/comments/${commentId}`);
}
