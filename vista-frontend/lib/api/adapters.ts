
import type {
  Agent,
  Comment as ViewComment,
  InspectionSlot,
  Listing,
  Offer,
} from "@/lib/types";
import {
  listingLifecycleStatus,
  listingMarketStatus,
} from "@/lib/types";
import type {
  CommentResponse,
  ListingResponse,
  OfferResponse,
  PhotoResponse,
  PublicUserProfile,
  SlotResponse,
} from "./types";
import {
  publicProfileAgentVerified,
  publicProfileDisplayName,
  publicProfileId,
} from "./public-profile";

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80";

export function listingFromApi(
  api: ListingResponse,
  photos: PhotoResponse[] = [],
): Listing {
  return {
    id: api.id,
    slug: api.id,
    title: api.title,
    purpose: api.purpose === "RENT" ? "rent" : "sale",
    type: api.property.type,
    bedrooms: api.property.bedrooms,
    bathrooms: api.property.bathrooms,
    toilets: api.property.toilets,
    area: api.property.area,
    city: api.property.city,
    state: api.property.state,
    description: api.description,
    highlights: api.property.highlights ?? [],
    amenities: api.property.amenities ?? [],
    fees: {
      rent: api.fees.rent,
      price: api.fees.price,
      caution: api.fees.caution,
      serviceCharge: api.fees.serviceCharge,
      agencyFee: api.fees.agencyFee,
      legalFee: api.fees.legalFee,
      rentFrequency:
        api.fees.rentFrequency === "MONTHLY" ? "monthly" : "yearly",
    },
    photos:
      photos.length > 0
        ? photos
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((p) => p.url)
        : [PLACEHOLDER_PHOTO],
    ownerId: api.ownerId,
    agentId: api.agentId,
    ownerVerified: api.ownerVerified ?? false,
    documentsVerified: api.documentsVerified ?? false,
    backendStatus: api.status,
    lifecycleStatus: listingLifecycleStatus(
      api.status,
    ),
    marketStatus: listingMarketStatus(
      api.status,
      api.purpose === "RENT" ? "rent" : "sale",
    ),
    createdAt: api.createdAt,
    views: api.views ?? 0,
    saves: api.saves ?? 0,
    likes: 0,
    inspections: api.inspections ?? 0,
    comments: api.commentCount ?? 0,
    virtualTourUrl: api.virtualTourUrl,
  };
}

export function agentFromProfile(profile: PublicUserProfile): Agent {
  const name = publicProfileDisplayName(profile);
  return {
    id: publicProfileId(profile),
    name,
    headline:
      profile.role === "AGENT"
        ? "Real estate agent on DreamHomes."
        : "DreamHomes member.",
    bio: "",
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
    city: "—",
    areasCovered: [],
    specializations: [],
    rating: profile.averageRating ?? 0,
    reviews: profile.reviewCount ?? 0,
    dealsClosed: 0,
    responseRate: 0,
    responseTimeMins: 0,
    feePercent: 0,
    verified: publicProfileAgentVerified(profile),
    joinedAt: profile.joinedAt,
    languages: [],
  };
}

export function commentFromApi(api: CommentResponse): ViewComment {
  return {
    id: api.id,
    listingId: api.listingId,
    applicantId: api.authorId,
    body: api.body,
    createdAt: api.createdAt,
    likes: 0,
    replies: [],
  };
}

export function slotFromApi(api: SlotResponse): InspectionSlot {
  return {
    id: api.id,
    listingId: api.listingId,
    startsAt: api.startsAt,
    endsAt: api.endsAt,
    durationMins: api.durationMins,
    status: api.status,
  };
}

export function offerFromApi(api: OfferResponse): Offer {
  return {
    id: api.id,
    listingId: api.listingId,
    applicantId: api.applicantId,
    applicantName: api.applicantName,
    proposedByUserId: api.proposedByUserId,
    amount: api.amount,
    message: api.message ?? null,
    status: api.status,
    parentOfferId: api.parentOfferId ?? null,
    createdAt: api.createdAt,
  };
}
