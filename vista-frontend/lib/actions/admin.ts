"use server";

import { revalidatePath, revalidateTag } from "next/cache";
const REVALIDATE_PROFILE = "max" as const;
import * as Admin from "@/lib/api/admin";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function approveListingAction(id: string): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Admin only." };
  try {
    await Admin.adminApproveListing(token, id);
    revalidateTag("listings", REVALIDATE_PROFILE);
    revalidateTag(`listing:${id}`, REVALIDATE_PROFILE);
    revalidatePath("/admin/listings");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return { ok: false, error: err.problem.title ?? "Could not approve." };
    }
    return { ok: false, error: "Could not approve." };
  }
}

export async function takedownListingAction(
  id: string,
  reason: string,
  notifyOwner = true,
  notifyAgent = true,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Admin only." };
  if (!reason.trim()) return { ok: false, error: "Provide a reason." };
  try {
    await Admin.adminTakedownListing(token, id, {
      reason,
      notifyOwner,
      notifyAgent,
    });
    revalidateTag("listings", REVALIDATE_PROFILE);
    revalidateTag(`listing:${id}`, REVALIDATE_PROFILE);
    revalidatePath("/admin/listings");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return { ok: false, error: err.problem.title ?? "Could not take down." };
    }
    return { ok: false, error: "Could not take down." };
  }
}

export async function suspendUserAction(
  id: string,
  reason: string,
  durationDays?: number,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Admin only." };
  if (!reason.trim()) return { ok: false, error: "Provide a reason." };
  try {
    await Admin.adminSuspendUser(token, id, { reason, durationDays });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return { ok: false, error: err.problem.title ?? "Could not suspend." };
    }
    return { ok: false, error: "Could not suspend." };
  }
}

export async function reactivateUserAction(id: string): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Admin only." };
  try {
    await Admin.adminReactivateUser(token, id);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return { ok: false, error: err.problem.title ?? "Could not reactivate." };
    }
    return { ok: false, error: "Could not reactivate." };
  }
}
