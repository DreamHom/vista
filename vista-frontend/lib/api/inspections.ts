import { havenFetch } from "./http";
import type {
  CreateSlotRequest,
  InspectionResponse,
  RequestInspectionRequest,
  SlotResponse,
} from "./types";

export async function listListingSlots(
  listingId: string,
): Promise<SlotResponse[]> {
  return havenFetch<SlotResponse[]>(`/api/listings/${listingId}/slots`, {
    revalidate: 15,
    tags: [`listing:${listingId}:slots`],
  });
}

export async function createSlot(
  token: string,
  listingId: string,
  body: CreateSlotRequest,
): Promise<SlotResponse> {
  return havenFetch<SlotResponse>(`/api/listings/${listingId}/slots`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function requestInspection(
  token: string,
  body: RequestInspectionRequest,
): Promise<InspectionResponse> {
  return havenFetch<InspectionResponse>("/api/inspections", {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}
