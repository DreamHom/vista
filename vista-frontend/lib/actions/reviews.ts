"use server";

import { revalidateTag } from "next/cache";
const REVALIDATE_PROFILE = "max" as const;
import * as Reviews from "@/lib/api/reviews";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function postReviewAction(
  listingId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Sign in to leave a review." };

  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();
  if (!rating || rating < 1 || rating > 5) {
    return { ok: false, error: "Choose a rating between 1 and 5." };
  }
  if (!body) return { ok: false, error: "Write a short review first." };

  try {
    await Reviews.postReview(token, listingId, { rating, body });
    revalidateTag(`listing:${listingId}:reviews`, REVALIDATE_PROFILE);
    return { ok: true, message: "Review submitted." };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not submit review.",
      };
    }
    return { ok: false, error: "Could not submit review." };
  }
}

export async function deleteReviewAction(
  listingId: string,
  reviewId: string,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };

  try {
    await Reviews.deleteReview(token, reviewId, {
      reason: "Removed by review author from the frontend.",
    });
    revalidateTag(`listing:${listingId}:reviews`, REVALIDATE_PROFILE);
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not delete review.",
      };
    }
    return { ok: false, error: "Could not delete review." };
  }
}
