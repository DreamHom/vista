"use server";

import { revalidateTag } from "next/cache";
const REVALIDATE_PROFILE = "max" as const;
import * as Comments from "@/lib/api/comments";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function postCommentAction(
  listingId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) {
    return {
      ok: false,
      error: "Sign in to ask a question on this listing.",
    };
  }
  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { ok: false, error: "Please write your question first." };
  }
  try {
    await Comments.postComment(token, listingId, { body });
    revalidateTag(`listing:${listingId}:comments`, REVALIDATE_PROFILE);
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not post.",
      };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteCommentAction(
  commentId: string,
  listingId: string,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };
  try {
    await Comments.deleteComment(token, commentId);
    revalidateTag(`listing:${listingId}:comments`, REVALIDATE_PROFILE);
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not delete.",
      };
    }
    return { ok: false, error: "Could not delete." };
  }
}
