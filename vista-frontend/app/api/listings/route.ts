import { NextRequest, NextResponse } from "next/server";
import * as Listings from "@/lib/api/listings";
import type { CreateListingRequest } from "@/lib/api/types";
import {
  handleRouteError,
  parseNumberParam,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const data = await Listings.listListings({
      page: parseNumberParam(searchParams.get("page"), 0),
      size: parseNumberParam(searchParams.get("size"), 20),
      city: searchParams.get("city") ?? undefined,
      area: searchParams.get("area") ?? undefined,
      purpose:
        (searchParams.get("purpose") as "RENT" | "SALE" | null) ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? parseNumberParam(searchParams.get("minPrice"), 0)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseNumberParam(searchParams.get("maxPrice"), 0)
        : undefined,
      bedrooms: searchParams.get("bedrooms")
        ? parseNumberParam(searchParams.get("bedrooms"), 0)
        : undefined,
      type: searchParams.get("type") ?? undefined,
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<CreateListingRequest>(req);
    const listing = await Listings.createListing(token, body);
    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
