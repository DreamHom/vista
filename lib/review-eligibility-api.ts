import { api } from "@/lib/api";

export interface ReviewEligibilityResponse {
  listingStatus: "DRAFT" | "LIVE" | "CLOSED" | "PAUSED" | "TAKEN_DOWN";
  canReviewOwner: boolean;
  canReviewAgent: boolean;
  ownerUserId: number;
  agentUserId: number | null;
  reasons: {
    owner: string | null;
    agent: string | null;
  };
}

export function fetchReviewEligibility(listingId: number | string) {
  return api.get<ReviewEligibilityResponse>(`/listings/${listingId}/reviews/me/eligibility`);
}
