import { havenFetch } from "./http";
import { normalizePage } from "./page";
import type {
  DeleteReviewRequest,
  PostReviewRequest,
  ReviewResponse,
} from "./types";

export async function listListingReviews(
  listingId: string,
): Promise<ReviewResponse[]> {
  const raw = await havenFetch<unknown>(`/api/listings/${listingId}/reviews`, {
    revalidate: 30,
    tags: [`listing:${listingId}:reviews`],
  });
  return normalizePage<ReviewResponse>(raw).content;
}

export async function postReview(
  token: string,
  listingId: string,
  body: PostReviewRequest,
): Promise<ReviewResponse> {
  return havenFetch<ReviewResponse>(`/api/listings/${listingId}/reviews`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function deleteReview(
  token: string,
  id: string,
  body: DeleteReviewRequest,
): Promise<void> {
  await havenFetch<void>(`/api/reviews/${id}`, {
    method: "DELETE",
    token,
    body,
    cache: "no-store",
  });
}
