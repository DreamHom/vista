"use server";

import { revalidatePath } from "next/cache";
import * as Verification from "@/lib/api/verification";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";
import type { VerificationTrack } from "@/lib/api/types";

export async function submitVerificationAction(
  track: VerificationTrack,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };

  const documentUrls = String(formData.get("documentUrls") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const note = (formData.get("note") as string) || undefined;
  const listingId = (formData.get("listingId") as string) || undefined;

  if (documentUrls.length === 0) {
    return { ok: false, error: "Attach at least one document link." };
  }

  try {
    await Verification.submitVerification(token, {
      track,
      listingId,
      documentUrls,
      note,
    });
    revalidatePath("/dashboard/verification");
    return {
      ok: true,
      message:
        "Submitted. Our verification team reviews within 1–3 business days.",
    };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error:
          err.problem.title ?? err.problem.detail ?? "Could not submit.",
      };
    }
    return { ok: false, error: "Could not submit." };
  }
}

export async function approveVerificationAction(id: string): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Admin only." };
  try {
    await Verification.adminApproveVerification(token, id);
    revalidatePath("/admin/verifications");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return { ok: false, error: err.problem.title ?? "Could not approve." };
    }
    return { ok: false, error: "Could not approve." };
  }
}

export async function rejectVerificationAction(
  id: string,
  reason: string,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Admin only." };
  if (!reason.trim()) return { ok: false, error: "Provide a reason." };
  try {
    await Verification.adminRejectVerification(token, id, { reason });
    revalidatePath("/admin/verifications");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return { ok: false, error: err.problem.title ?? "Could not reject." };
    }
    return { ok: false, error: "Could not reject." };
  }
}
