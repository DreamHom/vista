import { havenFetch } from "./http";
import { normalizePage } from "./page";
import type { PublicUserProfile, ReviewResponse } from "./types";

export async function getUserProfile(
  userId: string,
): Promise<PublicUserProfile> {
  return havenFetch<PublicUserProfile>(`/api/users/${userId}/profile`, {
    revalidate: 60,
    tags: [`user:${userId}`],
  });
}

export async function getUserReviews(
  userId: string,
): Promise<ReviewResponse[]> {
  const raw = await havenFetch<unknown>(`/api/users/${userId}/reviews`, {
    revalidate: 60,
    tags: [`user:${userId}:reviews`],
  });
  return normalizePage<ReviewResponse>(raw).content;
}
