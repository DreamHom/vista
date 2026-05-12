import { havenFetch } from "./http";
import { normalizePage } from "./page";
import type { CommentResponse, PostCommentRequest } from "./types";

export async function listListingComments(
  listingId: string,
): Promise<CommentResponse[]> {
  const raw = await havenFetch<unknown>(`/api/listings/${listingId}/comments`, {
    revalidate: 15,
    tags: [`listing:${listingId}:comments`],
  });
  return normalizePage<CommentResponse>(raw).content;
}

export async function postComment(
  token: string,
  listingId: string,
  body: PostCommentRequest,
): Promise<CommentResponse> {
  return havenFetch<CommentResponse>(`/api/listings/${listingId}/comments`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function deleteComment(
  token: string,
  id: string,
): Promise<void> {
  await havenFetch<void>(`/api/comments/${id}`, {
    method: "DELETE",
    token,
    cache: "no-store",
  });
}
