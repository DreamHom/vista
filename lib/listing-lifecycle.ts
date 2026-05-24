import type { OwnerListingResponse } from "@/lib/owner-dashboard";

export type ListingStatus = OwnerListingResponse["status"];

/** Owner-initiated status moves the API documents for PATCH /listings/{id}. */
export type OwnerListingStatusAction = "pause" | "resume" | "close";

const STATUS_LABEL: Record<ListingStatus, string> = {
  LIVE: "Live",
  PAUSED: "Paused",
  CLOSED: "Closed",
  TAKEN_DOWN: "Taken down",
};

export function listingStatusLabel(status: ListingStatus | "NONE"): string {
  if (status === "NONE") return "No listing";
  return STATUS_LABEL[status];
}

export function listingStatusVariant(status: ListingStatus): "success" | "warning" | "outline" {
  if (status === "LIVE") return "success";
  if (status === "PAUSED" || status === "TAKEN_DOWN") return "warning";
  return "outline";
}

export function ownerListingStatusActions(status: ListingStatus): OwnerListingStatusAction[] {
  switch (status) {
    case "LIVE":
      return ["pause", "close"];
    case "PAUSED":
      return ["resume"];
    default:
      return [];
  }
}

export function nextStatusForOwnerAction(
  status: ListingStatus,
  action: OwnerListingStatusAction,
): ListingStatus | null {
  switch (action) {
    case "pause":
      return status === "LIVE" ? "PAUSED" : null;
    case "resume":
      return status === "PAUSED" ? "LIVE" : null;
    case "close":
      return status === "LIVE" || status === "PAUSED" ? "CLOSED" : null;
    default:
      return null;
  }
}

export function ownerListingActionLabel(action: OwnerListingStatusAction): string {
  switch (action) {
    case "pause":
      return "Pause listing";
    case "resume":
      return "Resume listing";
    case "close":
      return "Close listing";
  }
}

/** Prefer the listing applicants can act on; fall back to newest. */
export function pickPrimaryListingForProperty(
  listings: OwnerListingResponse[],
  propertyId: number,
): OwnerListingResponse | null {
  const forProperty = listings.filter((row) => row.propertyId === propertyId);
  if (forProperty.length === 0) return null;

  const live = forProperty.find((row) => row.status === "LIVE");
  if (live) return live;

  const paused = forProperty.find((row) => row.status === "PAUSED");
  if (paused) return paused;

  const takenDown = forProperty.find((row) => row.status === "TAKEN_DOWN");
  if (takenDown) return takenDown;

  return [...forProperty].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )[0]!;
}

export function sortListingsNewestFirst(listings: OwnerListingResponse[]): OwnerListingResponse[] {
  return [...listings].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function listingOfferLabel(listing: OwnerListingResponse): string {
  const type = listing.listingType === "RENT" ? "Rent" : "Sale";
  return `${type} · ${STATUS_LABEL[listing.status]}`;
}
