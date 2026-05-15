import { api } from "@/lib/api";
import { getDreamAiInventory } from "@/lib/seed/public-data";
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
  /** JSON string from Haven, or already-parsed object when the client normalizes responses. */
  documentRefs?: string | Record<string, unknown> | null;
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
  /** Stable key for lists (multiple audit rows can reference the same listing id). */
  rowKey: string;
}

export interface ModerationCommentItem {
  key: string;
  flagId: number;
  commentId: string;
  listingId: number;
  listingTitle: string;
  listingAddress: string;
  author: string;
  body: string;
  flaggedAt: string;
  flagReason: string;
}

export type AdCampaignStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "PAUSED"
  | "ENDED";

export interface AdCampaignRow {
  id: number;
  sponsorUserId: number;
  title: string;
  body: string;
  status: AdCampaignStatus;
  budgetCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPlatformSettings {
  ownerIdentityRequired: boolean;
  propertyDocumentsRequired: boolean;
  agentCredentialsRequired: boolean;
  defaultCommissionRate: number;
  ownerResponseSlaHours: number;
  inspectionConflictBufferMinutes: number;
  featuredAgentDailyRate: number;
  featuredListingDailyRate: number;
}

export const DEFAULT_ADMIN_PLATFORM_SETTINGS: AdminPlatformSettings = {
  ownerIdentityRequired: true,
  propertyDocumentsRequired: true,
  agentCredentialsRequired: true,
  defaultCommissionRate: 7.5,
  ownerResponseSlaHours: 24,
  inspectionConflictBufferMinutes: 30,
  featuredAgentDailyRate: 35000,
  featuredListingDailyRate: 50000,
};

function coalesceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function coalesceNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Maps Haven `platform_settings.settings` JSON to the admin UI shape (flat keys). */
export function parseAdminPlatformSettingsFromJson(settings: Record<string, unknown> | null | undefined): AdminPlatformSettings {
  const s = settings ?? {};
  const d = DEFAULT_ADMIN_PLATFORM_SETTINGS;
  return {
    ownerIdentityRequired: coalesceBoolean(s.ownerIdentityRequired, d.ownerIdentityRequired),
    propertyDocumentsRequired: coalesceBoolean(s.propertyDocumentsRequired, d.propertyDocumentsRequired),
    agentCredentialsRequired: coalesceBoolean(s.agentCredentialsRequired, d.agentCredentialsRequired),
    defaultCommissionRate: coalesceNumber(s.defaultCommissionRate, d.defaultCommissionRate),
    ownerResponseSlaHours: coalesceNumber(s.ownerResponseSlaHours, d.ownerResponseSlaHours),
    inspectionConflictBufferMinutes: coalesceNumber(s.inspectionConflictBufferMinutes, d.inspectionConflictBufferMinutes),
    featuredAgentDailyRate: coalesceNumber(s.featuredAgentDailyRate, d.featuredAgentDailyRate),
    featuredListingDailyRate: coalesceNumber(s.featuredListingDailyRate, d.featuredListingDailyRate),
  };
}

function adminPlatformSettingsToPatch(settings: AdminPlatformSettings): Record<string, unknown> {
  return { ...settings };
}

export interface AdminPlatformSettingsPayload {
  settings: AdminPlatformSettings;
  updatedAt: string | null;
}

export async function fetchAdminPlatformSettings(): Promise<AdminPlatformSettingsPayload> {
  const res = await api.get<{ settings?: Record<string, unknown>; updatedAt?: string | null }>("/admin/platform-settings");
  return {
    settings: parseAdminPlatformSettingsFromJson(res.settings),
    updatedAt: res.updatedAt ?? null,
  };
}

export async function patchAdminPlatformSettings(settings: AdminPlatformSettings): Promise<AdminPlatformSettingsPayload> {
  const res = await api.patch<{ settings?: Record<string, unknown>; updatedAt?: string | null }>("/admin/platform-settings", {
    patch: adminPlatformSettingsToPatch(settings),
  });
  return {
    settings: parseAdminPlatformSettingsFromJson(res.settings),
    updatedAt: res.updatedAt ?? null,
  };
}

interface CommentFlagApiRow {
  id: number;
  listingId: number;
  commentId: number;
  reporterUserId: number;
  reason?: string | null;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

interface ListingSnippet {
  title?: string | null;
  property?: { address?: string | null } | null;
}

async function resolveListingSnippet(listingId: number): Promise<{ title: string; address: string }> {
  try {
    const listing = await api.get<ListingSnippet>(`/listings/${listingId}`);
    return {
      title: listing.title?.trim() || `Listing #${listingId}`,
      address: listing.property?.address?.trim() ?? "",
    };
  } catch {
    try {
      const snap = await api.get<{ listing?: ListingSnippet | null; property?: { address?: string | null } | null }>(
        `/admin/listings/${listingId}/moderation-snapshot`,
      );
      const listing = snap.listing;
      return {
        title: listing?.title?.trim() || `Listing #${listingId}`,
        address: listing?.property?.address?.trim() ?? snap.property?.address?.trim() ?? "",
      };
    } catch {
      return { title: `Listing #${listingId}`, address: "" };
    }
  }
}

export async function listAdminAdCampaigns(): Promise<AdCampaignRow[]> {
  const res = await api.get<PagedModel<AdCampaignRow>>("/admin/ad-campaigns", { query: { page: 0, size: 100 } });
  return res.content;
}

export async function patchAdminAdCampaign(campaignId: number, status: AdCampaignStatus): Promise<AdCampaignRow> {
  return api.patch<AdCampaignRow>(`/admin/ad-campaigns/${campaignId}`, { status });
}

export async function dismissAdminCommentFlag(flagId: number) {
  return api.post<CommentFlagApiRow>(`/admin/comment-flags/${flagId}/dismiss`);
}

export async function resolveAdminCommentFlag(flagId: number) {
  return api.post<CommentFlagApiRow>(`/admin/comment-flags/${flagId}/resolve`);
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
    rowKey: `inventory-${listing.id}`,
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
      rowKey: `audit-${item.id}`,
    }));

  return [...liveRows, ...auditRows].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function listAdminModerationComments(): Promise<ModerationCommentItem[]> {
  const page = await api.get<PagedModel<CommentFlagApiRow>>("/admin/comment-flags", {
    query: { status: "OPEN", page: 0, size: 100 },
  });

  const flags = page.content.filter((row) => row.status === "OPEN");
  const listingIds = [...new Set(flags.map((f) => f.listingId))];

  const [snippets, commentMaps] = await Promise.all([
    Promise.all(listingIds.map(async (id) => [id, await resolveListingSnippet(id)] as const)).then((entries) => new Map(entries)),
    Promise.all(
      listingIds.map(async (id) => {
        const res = await api
          .get<PagedModel<{ id: number; authorUserId: number; body: string }>>(`/listings/${id}/comments`, {
            query: { page: 0, size: 200 },
          })
          .catch(() => ({ content: [] as { id: number; authorUserId: number; body: string }[] }));
        const map = new Map<number, { body: string; authorUserId: number }>();
        for (const c of res.content) map.set(c.id, { body: c.body, authorUserId: c.authorUserId });
        return [id, map] as const;
      }),
    ).then((entries) => new Map(entries)),
  ]);

  const authorIds = new Set<number>();
  for (const flag of flags) {
    const row = commentMaps.get(flag.listingId)?.get(flag.commentId);
    if (row) authorIds.add(row.authorUserId);
  }
  const authorProfiles = await Promise.all([...authorIds].map((id) => getPublicProfile(id)));
  const authorNameById = new Map([...authorIds].map((id, index) => [id, authorProfiles[index]?.fullName ?? `User #${id}`] as const));

  return flags
    .map((flag) => {
      const snippet = snippets.get(flag.listingId) ?? { title: `Listing #${flag.listingId}`, address: "" };
      const comment = commentMaps.get(flag.listingId)?.get(flag.commentId);
      const author = comment ? (authorNameById.get(comment.authorUserId) ?? `User #${comment.authorUserId}`) : "Unknown author";
      const body =
        comment?.body?.trim() ||
        `Comment #${flag.commentId} (text unavailable — it may have been removed or is outside the fetched page).`;

      return {
        key: `flag-${flag.id}`,
        flagId: flag.id,
        commentId: String(flag.commentId),
        listingId: flag.listingId,
        listingTitle: snippet.title,
        listingAddress: snippet.address,
        author,
        body,
        flaggedAt: flag.createdAt,
        flagReason: flag.reason?.trim() || "Flagged for review",
      } satisfies ModerationCommentItem;
    })
    .sort((left, right) => new Date(right.flaggedAt).getTime() - new Date(left.flaggedAt).getTime());
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
      return {
        id: agent.id,
        name: profile?.fullName ?? agent.fullName ?? agent.email,
        dealsClosed: profile?.closedDealCount ?? 0,
        medianResponseMinutes: profile?.medianResponseMinutes ?? null,
        rating: profile?.averageRating ?? null,
        reviewCount: profile?.reviewCount ?? 0,
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
