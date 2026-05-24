import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import type { OfferResponse } from "@/lib/applicant-dashboard";
import type { PublicReview } from "@/lib/seed/public-data";
import type { Role } from "@/lib/types";

export interface ReviewRevieweeOption {
  userId: number;
  label: string;
}

export type ReviewEligibility =
  | { kind: "can_post"; reviewees: ReviewRevieweeOption[] }
  | { kind: "blocked"; message: string };

export function listingHasAcceptedOffer(offers: OfferResponse[], listingId: number): boolean {
  return offers.some((offer) => offer.listingId === listingId && offer.status === "ACCEPTED");
}

/** Haven POST /reviews gate: CLOSED listing + ACCEPTED offer + reviewee is owner or assigned agent. */
export function evaluateReviewEligibility({
  listingId,
  listingStatus,
  viewerUserId,
  viewerRole,
  ownerId,
  agentId,
  offers,
  existingReviews,
}: {
  listingId: number;
  listingStatus: string;
  viewerUserId: number;
  viewerRole: Role;
  ownerId: number;
  agentId: number | null;
  offers: OfferResponse[];
  existingReviews: PublicReview[];
}): ReviewEligibility {
  if (listingStatus !== "CLOSED") {
    return {
      kind: "blocked",
      message:
        "Reviews open after the deal closes on this listing. If you just accepted an offer, the listing may still be winding down.",
    };
  }

  if (!listingHasAcceptedOffer(offers, listingId)) {
    return {
      kind: "blocked",
      message: "Only parties with an accepted offer on this closed listing can leave a review.",
    };
  }

  if (viewerRole === "OWNER") {
    return {
      kind: "blocked",
      message:
        "Buyer reviews appear here once posted. Reviewing your buyer from this page is not wired in Haven yet — you will see their rating on your profile when they post.",
    };
  }

  if (viewerRole !== "APPLICANT") {
    return {
      kind: "blocked",
      message: "Post-deal reviews are for applicants who closed on this listing.",
    };
  }

  const alreadyReviewed = new Set(
    existingReviews
      .filter((row) => row.reviewerUserId === viewerUserId)
      .map((row) => row.revieweeUserId)
      .filter((id): id is number => typeof id === "number"),
  );

  const reviewees: ReviewRevieweeOption[] = [];
  if (!alreadyReviewed.has(ownerId)) {
    reviewees.push({ userId: ownerId, label: "Property owner" });
  }
  if (agentId != null && !alreadyReviewed.has(agentId)) {
    reviewees.push({ userId: agentId, label: "Assigned agent" });
  }

  if (reviewees.length === 0) {
    return {
      kind: "blocked",
      message: "You have already reviewed everyone you transacted with on this listing.",
    };
  }

  return { kind: "can_post", reviewees };
}

export function engagementErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return apiErrorMessage(error, "You are not allowed to do that on this listing.");
    }
    if (error.status === 409) {
      return apiErrorMessage(
        error,
        "That action was already recorded — refresh the page to see the latest state.",
      );
    }
  }
  return apiErrorMessage(error, fallback);
}
