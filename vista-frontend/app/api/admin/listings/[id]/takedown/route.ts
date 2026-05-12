import { NextRequest, NextResponse } from "next/server";
import * as Admin from "@/lib/api/admin";
import type { TakedownListingRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;
  try {
    const body = await readJsonBody<TakedownListingRequest>(req);
    const listing = await Admin.adminTakedownListing(token, id, body);
    return NextResponse.json(listing);
  } catch (err) {
    return handleRouteError(err);
  }
}
