import { api } from "@/lib/api";
import type { PagedModel } from "@/lib/applicant-dashboard";

export interface CommentResponse {
  id: number;
  listingId: number;
  authorUserId: number;
  body: string;
  createdAt: string;
}

export interface ReviewResponse {
  id: number;
  listingId: number;
  reviewerUserId: number;
  revieweeUserId: number;
  rating: number;
  body: string;
  createdAt: string;
}

export async function listListingComments(listingId: number, size = 20) {
  const response = await api.get<PagedModel<CommentResponse>>(`/listings/${listingId}/comments`, {
    query: { page: 0, size },
  });
  return response.content;
}

export async function postListingComment(listingId: number, body: string) {
  return api.post<CommentResponse>(`/listings/${listingId}/comments`, { body });
}

export async function flagListingComment(listingId: number, commentId: number, reason?: string) {
  return api.post(`/listings/${listingId}/comments/${commentId}/flag`, { reason: reason?.trim() || undefined });
}

export async function deleteComment(commentId: number, reason?: string) {
  return api.delete<void>(`/comments/${commentId}`, { body: { reason: reason?.trim() || "" } });
}

export async function postListingReview(
  listingId: number,
  payload: { revieweeUserId: number; rating: number; body: string },
) {
  return api.post<ReviewResponse>(`/listings/${listingId}/reviews`, payload);
}

export async function deleteReview(reviewId: number, reason = "") {
  return api.delete<void>(`/reviews/${reviewId}`, { body: { reason } });
}
