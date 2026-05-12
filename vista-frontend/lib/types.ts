export type Role = "applicant" | "owner" | "agent" | "admin";

export type ListingPurpose = "rent" | "sale";

export type VerificationSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Frontend-derived account state from PublicUserProfile verification stamps. */
export type UserVerificationState =
  | "unverified"
  | "identity_verified"
  | "agent_credentials_verified";

export type BackendListingStatus =
  | "DRAFT"
  | "LIVE"
  | "PAUSED"
  | "UNDER_OFFER"
  | "CLOSED";

export type ListingLifecycleStatus = "draft" | "live" | "paused" | "closed";

export type ListingMarketStatus =
  | "available"
  | "under_offer"
  | "rented"
  | "sold"
  | "off_market";

export type LeadTemperature = "cold" | "warm" | "hot";

export interface FeeBreakdown {
  rent?: number;
  price?: number;
  caution?: number;
  serviceCharge?: number;
  agencyFee?: number;
  legalFee?: number;
  rentFrequency?: "monthly" | "yearly";
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  purpose: ListingPurpose;
  type: string;
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  area: string;
  city: string;
  state: string;
  description: string;
  highlights: string[];
  amenities: string[];
  fees: FeeBreakdown;
  photos: string[];
  ownerId: string;
  agentId?: string;
  ownerVerified: boolean;
  documentsVerified: boolean;
  backendStatus: BackendListingStatus;
  lifecycleStatus: ListingLifecycleStatus;
  marketStatus: ListingMarketStatus;
  createdAt: string;
  views: number;
  saves: number;
  likes: number;
  inspections: number;
  comments: number;
  virtualTourUrl?: string;
  pricePerNight?: never;
}

export interface Agent {
  id: string;
  name: string;
  headline: string;
  bio: string;
  avatar: string;
  city: string;
  areasCovered: string[];
  specializations: string[];
  rating: number;
  reviews: number;
  dealsClosed: number;
  responseRate: number;
  responseTimeMins: number;
  feePercent: number;
  verified: boolean;
  joinedAt: string;
  languages: string[];
}

export interface Owner {
  id: string;
  name: string;
  avatar: string;
  joinedAt: string;
  verified: boolean;
  listings: number;
  city: string;
}

export interface Applicant {
  id: string;
  name: string;
  avatar: string;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  intent: ListingPurpose;
  trustBadge: boolean;
  joinedAt: string;
}

/** Raw slot row from the backend. */
export type InspectionSlotStatus = "OPEN" | "BOOKED" | "COMPLETED" | "CANCELLED";

export interface InspectionSlot {
  id: string;
  listingId: string;
  startsAt: string;
  endsAt: string;
  durationMins: number;
  status: InspectionSlotStatus;
}

/** Inspection booking row tied to a slot. */
export type InspectionStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export interface Inspection {
  id: string;
  listingId: string;
  slotId: string;
  applicantId: string;
  applicantName?: string;
  status: InspectionStatus;
  notes?: string | null;
  createdAt: string;
}

/** Immutable offer row from the backend negotiation chain. */
export type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "AUTO_DECLINED";
export type Proposer = "applicant" | "owner" | "agent";

export interface Offer {
  id: string;
  listingId: string;
  applicantId: string;
  applicantName?: string;
  proposedByUserId: number | string;
  amount: string;
  message: string | null;
  status: OfferStatus;
  parentOfferId?: string | null;
  createdAt: string;
}

export interface OfferHistoryEntry {
  by: Proposer;
  amount: string;
  note: string | null;
  at: string;
  status: OfferStatus;
}

export interface Lead {
  id: string;
  listingId: string;
  applicantId: string;
  temperature: LeadTemperature;
  source: "search" | "dream-ai" | "agent" | "comment";
  lastActivityAt: string;
}

export interface Comment {
  id: string;
  listingId: string;
  applicantId: string;
  body: string;
  createdAt: string;
  likes: number;
  replies: Array<{
    by: "owner" | "agent";
    body: string;
    at: string;
  }>;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  preview: string;
  unread: number;
  updatedAt: string;
  context?: { listingId?: string };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  at: string;
}

export interface AdminVerificationItem {
  id: string;
  track: "owner" | "agent" | "property" | "applicant";
  subject: string;
  submittedAt: string;
  status: VerificationSubmissionStatus;
  documents: string[];
  submittedBy: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  meta?: string;
}

export function verificationStateFromProfile(input: {
  identityVerifiedAt?: string | null;
  agentCredentialVerifiedAt?: string | null;
}): UserVerificationState {
  if (input.agentCredentialVerifiedAt) return "agent_credentials_verified";
  if (input.identityVerifiedAt) return "identity_verified";
  return "unverified";
}

export function buildOfferHistory(
  chain: Offer[],
  listingOwnerId: number,
): OfferHistoryEntry[] {
  return [...chain]
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    .map((row) => ({
      by:
        sameEntityId(row.proposedByUserId, listingOwnerId)
          ? "owner"
          : sameEntityId(row.proposedByUserId, row.applicantId)
            ? "applicant"
            : "agent",
      amount: row.amount,
      note: row.message,
      at: row.createdAt,
      status: row.status,
    }));
}

export function latestActiveOffer(chain: Offer[]): Offer | null {
  return (
    [...chain]
      .filter((o) => o.status === "PENDING")
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] ??
    null
  );
}

function sameEntityId(a: string | number, b: string | number): boolean {
  return String(a) === String(b);
}

export function listingLifecycleStatus(
  status: BackendListingStatus,
): ListingLifecycleStatus {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "LIVE":
    case "UNDER_OFFER":
      return "live";
    case "PAUSED":
      return "paused";
    case "CLOSED":
      return "closed";
  }
}

export function listingMarketStatus(
  status: BackendListingStatus,
  purpose: ListingPurpose,
): ListingMarketStatus {
  switch (status) {
    case "UNDER_OFFER":
      return "under_offer";
    case "CLOSED":
      return purpose === "rent" ? "rented" : "sold";
    case "PAUSED":
      return "off_market";
    case "DRAFT":
    case "LIVE":
    default:
      return "available";
  }
}

export function listingStatusLabel(listing: Pick<Listing, "backendStatus" | "marketStatus">): string {
  if (listing.backendStatus === "UNDER_OFFER") return "under offer";
  if (listing.backendStatus === "PAUSED") return "paused";
  if (listing.backendStatus === "DRAFT") return "draft";
  if (listing.backendStatus === "CLOSED") {
    return listing.marketStatus === "sold" ? "sold" : "rented";
  }
  return "live";
}

export function listingStatusTone(listing: Pick<Listing, "backendStatus">): "success" | "muted" {
  return listing.backendStatus === "LIVE" || listing.backendStatus === "UNDER_OFFER"
    ? "success"
    : "muted";
}
