import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-error-message";
import type { OfferResponse } from "@/lib/applicant-dashboard";

export type OfferWithListing = {
  offer: OfferResponse;
  listing: { status?: string; title?: string | null } | null;
};

/** Haven rule: only the party who did not propose the current PENDING row may accept/decline/counter. */
export function isOwnOfferProposal(offer: OfferResponse, viewerUserId: number): boolean {
  return offer.proposedByUserId === viewerUserId;
}

export function applicantCanRespondToCounter(counter: OfferResponse, applicantUserId: number): boolean {
  return counter.status === "PENDING" && !isOwnOfferProposal(counter, applicantUserId);
}

/** Permanent record of who won on this listing (status ACCEPTED). */
export function findAcceptedOfferOnListing<T extends OfferWithListing>(
  items: T[],
  listingId: number,
): T | undefined {
  return items.find((row) => row.offer.listingId === listingId && row.offer.status === "ACCEPTED");
}

export function listingHasAcceptedOffer<T extends OfferWithListing>(items: T[], listingId: number): boolean {
  return Boolean(findAcceptedOfferOnListing(items, listingId));
}

export function ownerCanRespondToOffer<T extends OfferWithListing>(
  item: T,
  ownerUserId: number,
  allOnListing: T[],
): boolean {
  if (item.offer.status !== "PENDING") return false;
  if (isOwnOfferProposal(item.offer, ownerUserId)) return false;
  if (listingHasAcceptedOffer(allOnListing, item.offer.listingId)) return false;
  if (item.listing?.status === "CLOSED") return false;
  return true;
}

export function offersOnListing<T extends OfferWithListing>(items: T[], listingId: number): T[] {
  return items.filter((row) => row.offer.listingId === listingId);
}

/** Inline copy when the viewer must wait for the other party (turn-taking). */
export function ownerOfferWaitingHint<T extends OfferWithListing>(
  current: T,
  ownerUserId: number,
  allOnListing: T[],
): string | null {
  if (listingHasAcceptedOffer(allOnListing, current.offer.listingId)) return null;
  if (current.listing?.status === "CLOSED") return null;
  if (ownerCanRespondToOffer(current, ownerUserId, allOnListing)) return null;
  if (current.offer.status !== "PENDING") return null;
  if (isOwnOfferProposal(current.offer, ownerUserId)) {
    return "You sent the last move. The applicant must accept, reject, or counter before you can act on this thread again.";
  }
  return null;
}

export function applicantOfferWaitingHint(
  rootStatus: OfferResponse["status"],
  hasPendingCounterFromOther: boolean,
  lastProposedByViewer: boolean,
): string | null {
  if (hasPendingCounterFromOther) return null;
  if (rootStatus === "ACCEPTED" || rootStatus === "DECLINED" || rootStatus === "WITHDRAWN") return null;
  if (lastProposedByViewer) {
    return "You sent the last move. The owner must accept, reject, or counter before you can respond again.";
  }
  if (rootStatus === "PENDING") {
    return "Waiting for the owner to respond to your offer.";
  }
  return null;
}

export function offerNegotiationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "You cannot accept, reject, or counter an offer you proposed. Wait for the other party to respond.";
    }
    if (error.status === 409) {
      return "This offer is no longer open for that action. Refresh and check the latest row in the thread.";
    }
    return apiErrorMessage(error, "We could not update this offer.");
  }
  return apiErrorMessage(error, "We could not update this offer.");
}
