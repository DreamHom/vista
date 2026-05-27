import { api } from "@/lib/api";
import { getListingCoordinates } from "@/lib/seed/listing-map-points";
import type { PublicListing, PublicPhoto } from "@/lib/seed/public-data";

type ListingResponse = {
  id: number;
  propertyId: number;
  ownerId: number;
  listingType: "RENT" | "SALE";
  askingPrice: number;
  cautionFee: number | null;
  serviceCharge: number | null;
  agencyFee: number | null;
  title: string | null;
  description: string | null;
  headline: string | null;
  handoverDate: string | null;
  status: "LIVE" | "PAUSED" | "CLOSED" | "TAKEN_DOWN";
  viewCount: number | null;
  createdAt: string;
  updatedAt: string;
  ownerIdentityVerifiedAt?: string | null;
  property: {
    type: PublicListing["type"];
    address: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sizeSqm: number | null;
    documentsVerifiedAt?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  assignedAgentId: number | null;
  pendingReportCount: number | null;
};

type PhotoResponse = {
  url: string;
  caption: string | null;
};

function shortLocation(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  return address.trim();
}

function mapPhotos(photos: PhotoResponse[]): PublicPhoto[] {
  return photos.map((photo, index) => ({
    id: String(index),
    url: photo.url,
    alt: photo.caption?.trim() || `Listing photo ${index + 1}`,
  }));
}

function placeholderOwner(ownerId: number) {
  return {
    id: String(ownerId),
    name: "Listing owner",
    role: "OWNER" as const,
    verified: false,
    averageRating: null,
    reviewCount: 0,
    closedDealCount: null,
    medianResponseMinutes: null,
    joinedAt: null,
  };
}

/** Lightweight LIVE listing card for Dream AI compare / inline rails (browser). */
export async function fetchDreamAiListingCard(id: number | string): Promise<PublicListing | null> {
  const key = String(id);
  try {
    const [listing, photos] = await Promise.all([
      api.get<ListingResponse>(`/listings/${key}`, { skipAuth: true }),
      api.get<PhotoResponse[]>(`/listings/${key}/photos`, { skipAuth: true }).catch(() => [] as PhotoResponse[]),
    ]);

    const serverLat = listing.property.latitude;
    const serverLng = listing.property.longitude;
    const hasServerCoords =
      typeof serverLat === "number" &&
      typeof serverLng === "number" &&
      Number.isFinite(serverLat) &&
      Number.isFinite(serverLng);
    const { latitude, longitude } = hasServerCoords
      ? { latitude: serverLat, longitude: serverLng }
      : getListingCoordinates(key, listing.property.address);

    const gallery = mapPhotos(photos);
    const location = shortLocation(listing.property.address);

    return {
      id: key,
      propertyId: String(listing.propertyId),
      ownerId: String(listing.ownerId),
      agentId: listing.assignedAgentId ? String(listing.assignedAgentId) : null,
      title: listing.title?.trim() || listing.headline?.trim() || `Listing #${key}`,
      headline: listing.headline?.trim() || null,
      type: listing.property.type,
      term: listing.listingType,
      location,
      address: listing.property.address,
      priceNgn: listing.askingPrice,
      cautionFeeNgn: listing.cautionFee,
      serviceChargeNgn: listing.serviceCharge,
      agencyFeeNgn: null,
      bedrooms: listing.property.bedrooms,
      bathrooms: listing.property.bathrooms,
      sizeSqm: listing.property.sizeSqm,
      description: listing.description?.trim() || "",
      status: listing.status,
      handoverDate: listing.handoverDate,
      availableFrom: listing.handoverDate ?? "Available now",
      availability: "NOW",
      viewCount: listing.viewCount ?? 0,
      pendingReportCount: listing.pendingReportCount ?? 0,
      publishedAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      verified: Boolean(listing.property.documentsVerifiedAt),
      verificationLabel: listing.property.documentsVerifiedAt ? "Property Verified" : "Verification pending",
      ownerIdentityVerifiedAt: listing.ownerIdentityVerifiedAt ?? null,
      documentsVerifiedAt: listing.property.documentsVerifiedAt ?? null,
      photos: gallery,
      owner: placeholderOwner(listing.ownerId),
      agent: null,
      comments: [],
      slots: [],
      mapArea: location,
      latitude,
      longitude,
    };
  } catch {
    return null;
  }
}
