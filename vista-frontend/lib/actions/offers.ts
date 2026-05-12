"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Offers from "@/lib/api/offers";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type { ActionState } from "./listings";

export async function submitOfferAction(
  listingId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Sign in to submit an offer." };
  const amount = Number(formData.get("amount") ?? 0);
  const terms = (formData.get("terms") as string) || undefined;
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid offer amount." };
  }
  try {
    await Offers.submitOffer(token, { listingId, amount, terms });
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error:
          err.problem.title ??
          err.problem.detail ??
          "Could not submit your offer.",
      };
    }
    return { ok: false, error: "Could not submit your offer." };
  }
  revalidatePath("/dashboard/offers");
  redirect("/dashboard/offers?submitted=1");
}

export async function respondToOfferAction(
  offerId: string,
  status: "ACCEPTED" | "DECLINED",
  note?: string,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };
  try {
    await Offers.respondToOffer(token, offerId, { status, note });
    revalidatePath("/owner/offers");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error: err.problem.title ?? err.problem.detail ?? "Could not respond.",
      };
    }
    return { ok: false, error: "Could not respond." };
  }
}

export async function counterOfferAction(
  offerId: string,
  amount: number,
  terms?: string,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };
  if (!amount || amount <= 0) {
    return { ok: false, error: "Enter a valid counter amount." };
  }
  try {
    await Offers.counterOffer(token, offerId, { amount, terms });
    revalidatePath("/owner/offers");
    return { ok: true };
  } catch (err) {
    if (err instanceof HavenError) {
      return {
        ok: false,
        error:
          err.problem.title ?? err.problem.detail ?? "Could not counter.",
      };
    }
    return { ok: false, error: "Could not counter." };
  }
}
