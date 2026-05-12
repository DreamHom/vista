import { NextRequest, NextResponse } from "next/server";
import * as Listings from "@/lib/api/listings";
import type { UpdateListingRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const listing = await Listings.getListing(id);
    return NextResponse.json(listing);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;
  try {
    const body = await readJsonBody<UpdateListingRequest>(req);
    const listing = await Listings.updateListing(token, id, body);
    return NextResponse.json(listing);
  } catch (err) {
    return handleRouteError(err);
  }
}
