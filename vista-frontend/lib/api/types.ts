/**
 * Types mirror the Java DTOs described in the haven integration guide.
 * Java `Instant` → ISO-8601 string. `BigDecimal` → JSON number (Jackson default).
 *
 * Adjust shapes here once you wire up `openapi-typescript` against
 * GET /v3/api-docs — these are inference-grade until then.
 */

// ─── Common ────────────────────────────────────────────────────────────────
export type Iso = string;

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  /** Spring's validation error map: field → message */
  errors?: Record<string, string>;
}

// ─── Auth / Me ─────────────────────────────────────────────────────────────
export type Role = "APPLICANT" | "OWNER" | "AGENT" | "ADMIN";

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  displayName?: string;
  role: Role;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface MeResponse {
  id: string;
  email: string;
  role: Role;
  /** camelCase from Jackson (typical Java `displayName`) */
  displayName?: string;
  /** camelCase from Jackson (typical Java `fullName`) */
  fullName?: string;
  /** If global naming is snake_case, these mirror the same fields */
  display_name?: string;
  full_name?: string;
  firstName?: string;
  first_name?: string;
  givenName?: string;
  given_name?: string;
  lastName?: string;
  last_name?: string;
  familyName?: string;
  family_name?: string;
  surname?: string;
  phone?: string;
  identityVerifiedAt?: Iso;
  /** camelCase if haven maps agent credential stamp this way */
  credentialsVerifiedAt?: Iso;
  agentCredentialVerifiedAt?: Iso;
}

export interface MeProfileResponse extends MeResponse {
  budgetMin?: string | number;
  budgetMax?: string | number;
  city?: string;
  intent?: "RENT" | "SALE";
  headline?: string;
  bio?: string;
  areasCovered?: string[];
  specializations?: string[];
  languages?: string[];
  feePercent?: string | number;
  licenseNumber?: string;
}

export interface UpdateMeRequest {
  displayName?: string;
  phone?: string;
  budgetMin?: string;
  budgetMax?: string;
  city?: string;
  intent?: "RENT" | "SALE";
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAgentProfileRequest {
  headline?: string;
  bio?: string;
  areasCovered?: string[];
  specializations?: string[];
  languages?: string[];
  feePercent?: string;
  licenseNumber?: string;
}

/**
 * Mirrors haven `PublicUserProfile` Java record
 * (`GET /api/users/{userId}/profile`).
 *
 * Jackson serialises `Long` as JSON number by default — `id` may be number or string.
 */
export interface PublicUserProfile {
  id: number | string;
  fullName: string;
  displayName?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  role: Role;
  identityVerifiedAt?: Iso | null;
  agentCredentialVerifiedAt?: Iso | null;
  suspended: boolean;
  averageRating?: number | null;
  reviewCount: number;
  joinedAt: Iso;
}

export interface ReviewResponse {
  id: string;
  listingId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  subjectUserId?: string;
  rating: number; // 1..5
  body: string;
  createdAt: Iso;
}

// ─── Property + Listing ────────────────────────────────────────────────────
export type ListingPurpose = "RENT" | "SALE";
export type ListingStatus =
  | "DRAFT"
  | "LIVE"
  | "PAUSED"
  | "UNDER_OFFER"
  | "CLOSED";

export interface PropertyResponse {
  id: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  area: string;
  city: string;
  state: string;
  amenities: string[];
  highlights: string[];
}

export interface CreatePropertyRequest {
  type: string;
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  area: string;
  city: string;
  state: string;
  amenities?: string[];
  highlights?: string[];
}

export interface ListingFees {
  rent?: number;
  price?: number;
  caution?: number;
  serviceCharge?: number;
  agencyFee?: number;
  legalFee?: number;
  rentFrequency?: "MONTHLY" | "YEARLY";
}

export interface ListingResponse {
  id: string;
  ownerId: string;
  ownerName?: string;
  agentId?: string;
  agentName?: string;
  title: string;
  description: string;
  purpose: ListingPurpose;
  status: ListingStatus;
  fees: ListingFees;
  property: PropertyResponse;
  virtualTourUrl?: string;
  views?: number;
  saves?: number;
  inspections?: number;
  commentCount?: number;
  ownerVerified?: boolean;
  documentsVerified?: boolean;
  createdAt: Iso;
  updatedAt?: Iso;
}

export interface CreateListingRequest {
  propertyId: string;
  title: string;
  description: string;
  purpose: ListingPurpose;
  fees: ListingFees;
  virtualTourUrl?: string;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  fees?: ListingFees;
  virtualTourUrl?: string;
  status?: ListingStatus;
}

// ─── Photos ────────────────────────────────────────────────────────────────
export interface PhotoResponse {
  id: string;
  listingId: string;
  url: string;
  caption?: string;
  displayOrder: number;
}

// ─── Comments ──────────────────────────────────────────────────────────────
export interface CommentResponse {
  id: string;
  listingId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatarUrl?: string;
  body: string;
  createdAt: Iso;
  parentCommentId?: string;
}

export interface PostCommentRequest {
  body: string;
  parentCommentId?: string;
}

// ─── Saves ─────────────────────────────────────────────────────────────────
export interface SavedListingResponse {
  listingId: string;
  savedAt: Iso;
}

// ─── Inspections ───────────────────────────────────────────────────────────
export type SlotStatus = "OPEN" | "BOOKED" | "COMPLETED" | "CANCELLED";
export type InspectionStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED";

export interface SlotResponse {
  id: string;
  listingId: string;
  startsAt: Iso;
  endsAt: Iso;
  durationMins: number;
  status: SlotStatus;
}

export interface CreateSlotRequest {
  startsAt: Iso;
  durationMins: number;
}

export interface InspectionResponse {
  id: string;
  listingId: string;
  slotId: string;
  applicantId: string;
  applicantName?: string;
  status: InspectionStatus;
  notes?: string;
  createdAt: Iso;
}

export interface RequestInspectionRequest {
  slotId: string;
  note?: string;
}

// ─── Offers ────────────────────────────────────────────────────────────────
export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "AUTO_DECLINED";

export interface OfferResponse {
  id: string;
  listingId: string;
  applicantId: string;
  applicantName?: string;
  proposedByUserId: number | string;
  amount: string;
  message?: string | null;
  status: OfferStatus;
  parentOfferId?: string;
  createdAt: Iso;
}

export interface SubmitOfferRequest {
  listingId: string;
  amount: number;
  terms?: string;
}

export interface CounterOfferRequest {
  amount: number;
  terms?: string;
}

export interface RespondToOfferRequest {
  status: "ACCEPTED" | "DECLINED";
  note?: string;
}

// ─── Reports / Reviews submission ──────────────────────────────────────────
export interface ReportListingRequest {
  reason: string;
  details?: string;
}

export interface PostReviewRequest {
  rating: number;
  body: string;
  subjectUserId?: string;
}

export interface DeleteReviewRequest {
  reason: string;
}

// ─── Agent ↔ owner handshake ───────────────────────────────────────────────
export type AssignmentStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "REVOKED";

export interface AgentListingResponse {
  id: string;
  listingId: string;
  listingTitle?: string;
  ownerId: string;
  ownerName?: string;
  agentId: string;
  agentName?: string;
  status: AssignmentStatus;
  invitedAt: Iso;
  respondedAt?: Iso;
}

export interface RequestAgentAssignmentRequest {
  agentId: string;
  note?: string;
}

export interface DeclineAssignmentRequest {
  reason?: string;
}

export interface RevokeAssignmentRequest {
  reason?: string;
}

// ─── Notifications ─────────────────────────────────────────────────────────
export type NotificationType =
  | "INSPECTION_REQUESTED"
  | "INSPECTION_CONFIRMED"
  | "OFFER_SUBMITTED"
  | "OFFER_COUNTERED"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "OFFER_AUTO_DECLINED"
  | "ASSIGNMENT_INVITED"
  | "ASSIGNMENT_ACCEPTED"
  | "ASSIGNMENT_DECLINED"
  | "LISTING_APPROVED"
  | "LISTING_TAKEN_DOWN"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "COMMENT_REPLIED";

export interface NotificationResponse {
  id: string;
  type?: NotificationType | string;
  kind?: NotificationType | string;
  title: string;
  body?: string;
  href?: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: Iso | null;
  createdAt: Iso;
}

// ─── Verification ──────────────────────────────────────────────────────────
export type VerificationTrack =
  | "OWNER_IDENTITY"
  | "AGENT_CREDENTIALS"
  | "PROPERTY_DOCUMENTS"
  | "APPLICANT_IDENTITY";

export type VerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface VerificationResponse {
  id: string;
  track: VerificationTrack;
  status: VerificationStatus;
  submittedBy: string;
  submittedByName?: string;
  subject?: string;
  documents: { name: string; url?: string }[];
  submittedAt: Iso;
  decidedAt?: Iso;
  decisionNote?: string;
}

export interface SubmitVerificationRequest {
  track: VerificationTrack;
  /** Property/listing id for PROPERTY_DOCUMENTS, ignored otherwise. */
  listingId?: string;
  documentUrls: string[];
  note?: string;
}

export interface RejectVerificationRequest {
  reason: string;
}

// ─── Admin moderation ──────────────────────────────────────────────────────
export interface TakedownListingRequest {
  reason: string;
  notifyOwner?: boolean;
  notifyAgent?: boolean;
}

export interface SuspendUserRequest {
  reason: string;
  durationDays?: number;
}

export interface AdminAnalyticsSummary {
  activeUsers30d: number;
  newListings30d: number;
  inspectionsCompleted30d: number;
  closedDeals30d: number;
  funnel: {
    saved: number;
    inspectionRequested: number;
    offerSubmitted: number;
    closed: number;
  };
  topAreas: { area: string; demandScore: number }[];
}
