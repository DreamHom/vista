export type Role = "applicant" | "owner" | "agent" | "admin";

export type ListingPurpose = "rent" | "sale";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type ListingStatus =
  | "draft"
  | "live"
  | "under_offer"
  | "rented"
  | "sold"
  | "taken_down";

export type LeadTemperature = "cold" | "warm" | "hot";

export interface FeeBreakdown {
  rent?: number; // for rentals, monthly or annual based on `frequency`
  price?: number; // for sales
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
  area: string; // neighbourhood
  city: string;
  state: string;
  description: string;
  highlights: string[];
  amenities: string[];
  fees: FeeBreakdown;
  photos: string[]; // unsplash URLs
  ownerId: string;
  agentId?: string;
  ownerVerified: boolean;
  documentsVerified: boolean;
  status: ListingStatus;
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
  responseRate: number; // 0-100
  responseTimeMins: number;
  feePercent: number; // typical agency %
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
  trustBadge: boolean; // optional applicant verification reward
  joinedAt: string;
}

export interface InspectionSlot {
  id: string;
  listingId: string;
  date: string; // ISO
  durationMins: number;
  status: "open" | "booked" | "completed" | "no_show" | "cancelled";
  applicantId?: string;
  notes?: string;
}

export interface Offer {
  id: string;
  listingId: string;
  applicantId: string;
  amount: number;
  terms: string;
  status:
    | "submitted"
    | "countered"
    | "accepted"
    | "rejected"
    | "withdrawn";
  history: Array<{
    by: "applicant" | "owner" | "agent";
    amount: number;
    note?: string;
    at: string;
  }>;
  createdAt: string;
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
  subject: string; // person or listing name
  submittedAt: string;
  status: VerificationStatus;
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
