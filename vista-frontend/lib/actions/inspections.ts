"use server";

import { revalidateTag } from "next/cache";
const REVALIDATE_PROFILE = "max" as const;
import { redirect } from "next/navigation";
import * as Inspections from "@/lib/api/inspections";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function createSlotAction(
  listingId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };
  const startsAt = String(formData.get("startsAt") ?? "");
  const durationMins = Number(formData.get("durationMins") ?? 30);
  if (!startsAt) return { ok: false, error: "Pick a start time." };
  try {
    const slot = await Inspections.createSlot(token, listingId, {
      startsAt: new Date(startsAt).toISOString(),
      durationMins,
    });
    revalidateTag(`listing:${listingId}:slots`, REVALIDATE_PROFILE);
    return { ok: true, data: slot };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error:
          err.problem.title ??
          err.problem.detail ??
          "Could not create the slot.",
      };
    }
    return { ok: false, error: "Could not create the slot." };
  }
}

export async function requestInspectionAction(
  listingId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Sign in to request an inspection." };
  const slotId = String(formData.get("slotId") ?? "");
  const note = (formData.get("note") as string) || undefined;
  if (!slotId) return { ok: false, error: "Pick a slot first." };
  try {
    await Inspections.requestInspection(token, { slotId, note });
    revalidateTag(`listing:${listingId}:slots`, REVALIDATE_PROFILE);
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error:
          err.problem.title ??
          err.problem.detail ??
          "Could not book that slot.",
      };
    }
    return { ok: false, error: "Could not book that slot." };
  }
  redirect(`/dashboard/inspections?listingId=${listingId}`);
}
