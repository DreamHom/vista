"use server";

import { revalidatePath } from "next/cache";
import * as Saves from "@/lib/api/saves";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function toggleSaveAction(
  listingId: string,
  currentlySaved: boolean,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Sign in to save listings." };
  try {
    if (currentlySaved) {
      await Saves.unsaveListing(token, listingId);
    } else {
      await Saves.saveListing(token, listingId);
    }
    revalidatePath("/dashboard/saved");
    return { ok: true, data: { saved: !currentlySaved } };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not update.",
      };
    }
    return { ok: false, error: "Could not update." };
  }
}

export async function reportListingAction(
  listingId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };
  const reason = String(formData.get("reason") ?? "").trim();
  const details = (formData.get("details") as string) || undefined;
  if (!reason) return { ok: false, error: "Please choose a reason." };
  try {
    await Saves.reportListing(token, listingId, { reason, details });
    return {
      ok: true,
      message:
        "Reported. Our trust & safety team reviews reports within 24 hours.",
    };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not report.",
      };
    }
    return { ok: false, error: "Could not report." };
  }
}
