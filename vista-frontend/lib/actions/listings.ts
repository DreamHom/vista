"use server";

import { revalidateTag } from "next/cache";
const REVALIDATE_PROFILE = "max" as const;
import { redirect } from "next/navigation";
import * as Listings from "@/lib/api/listings";
import * as Properties from "@/lib/api/properties";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";
import type {
  CreateListingRequest,
  CreatePropertyRequest,
  ListingPurpose,
  UpdateListingRequest,
} from "@/lib/api/types";

export type ActionState =
  | { ok: true; message?: string; data?: unknown }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function toActionError(err: unknown): ActionState {
  if (err instanceof HavenError) {
    return {
      ok: false,
      error: err.problem.title ?? err.problem.detail ?? `HTTP ${err.status}`,
      fieldErrors: err.problem.errors,
    };
  }
  return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
}

export async function createListingAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };

  const propertyPayload: CreatePropertyRequest = {
    type: String(formData.get("propertyType") ?? "").trim(),
    bedrooms: Number(formData.get("bedrooms") ?? 0),
    bathrooms: Number(formData.get("bathrooms") ?? 0),
    toilets: formData.get("toilets")
      ? Number(formData.get("toilets"))
      : undefined,
    area: String(formData.get("area") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    amenities: String(formData.get("amenities") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    highlights: String(formData.get("highlights") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  const purpose = String(formData.get("purpose") ?? "RENT") as ListingPurpose;
  const listingPayload: Omit<CreateListingRequest, "propertyId"> = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    purpose,
    fees: {
      rent: formData.get("rent") ? Number(formData.get("rent")) : undefined,
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      caution: formData.get("caution")
        ? Number(formData.get("caution"))
        : undefined,
      serviceCharge: formData.get("serviceCharge")
        ? Number(formData.get("serviceCharge"))
        : undefined,
      agencyFee: formData.get("agencyFee")
        ? Number(formData.get("agencyFee"))
        : undefined,
      legalFee: formData.get("legalFee")
        ? Number(formData.get("legalFee"))
        : undefined,
      rentFrequency:
        purpose === "RENT"
          ? ((formData.get("rentFrequency") as
              | "MONTHLY"
              | "YEARLY"
              | null) ?? "YEARLY")
          : undefined,
    },
    virtualTourUrl: (formData.get("virtualTourUrl") as string) || undefined,
  };

  let listingId: string;
  try {
    const property = await Properties.createProperty(token, propertyPayload);
    const listing = await Listings.createListing(token, {
      propertyId: property.id,
      ...listingPayload,
    });
    listingId = listing.id;
  } catch (err) {
    return toActionError(err);
  }

  revalidateTag("listings", REVALIDATE_PROFILE);
  redirect(`/owner/listings/${listingId}`);
}

export async function updateListingAction(
  listingId: string,
  patch: UpdateListingRequest,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { ok: false, error: "You must be signed in." };
  try {
    await Listings.updateListing(token, listingId, patch);
    revalidateTag(`listing:${listingId}`, REVALIDATE_PROFILE);
    revalidateTag("listings", REVALIDATE_PROFILE);
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}
