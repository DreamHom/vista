"use server";

import { revalidatePath } from "next/cache";
import * as Auth from "@/lib/api/auth";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function updateMyProfileAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };

  try {
    const updated = await Auth.updateMe(token, {
      displayName: readOptional(formData, "displayName"),
      phone: readOptional(formData, "phone"),
      budgetMin: readOptional(formData, "budgetMin"),
      budgetMax: readOptional(formData, "budgetMax"),
      city: readOptional(formData, "city"),
      intent: readOptional(formData, "intent") as "RENT" | "SALE" | undefined,
    });
    revalidatePath("/dashboard/profile");
    revalidatePath("/owner/settings");
    revalidatePath("/agent/settings");
    return { ok: true, data: updated, message: "Profile updated." };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not update profile.",
      };
    }
    return { ok: false, error: "Could not update profile." };
  }
}

export async function updateAgentProfileAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };

  try {
    const updated = await Auth.updateMyAgentProfile(token, {
      headline: readOptional(formData, "headline"),
      bio: readOptional(formData, "bio"),
      feePercent: readOptional(formData, "feePercent"),
      licenseNumber: readOptional(formData, "licenseNumber"),
      areasCovered: readCsv(formData, "areasCovered"),
      specializations: readCsv(formData, "specializations"),
      languages: readCsv(formData, "languages"),
    });
    revalidatePath("/agent/profile");
    return { ok: true, data: updated, message: "Agent profile updated." };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error:
          err.problem.title ?? err.problem.detail ?? "Could not update agent profile.",
      };
    }
    return { ok: false, error: "Could not update agent profile." };
  }
}

export async function changePasswordAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Fill in both password fields." };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "New passwords do not match." };
  }

  try {
    await Auth.changeMyPassword(token, { currentPassword, newPassword });
    return { ok: true, message: "Password updated." };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not change password.",
      };
    }
    return { ok: false, error: "Could not change password." };
  }
}

function readOptional(formData: FormData, key: string): string | undefined {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

function readCsv(formData: FormData, key: string): string[] {
  const raw = String(formData.get(key) ?? "");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
