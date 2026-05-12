import { NextRequest, NextResponse } from "next/server";
import * as Offers from "@/lib/api/offers";
import type { RespondToOfferRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;
  try {
    const body = await readJsonBody<RespondToOfferRequest>(req);
    const offer = await Offers.respondToOffer(token, id, body);
    return NextResponse.json(offer);
  } catch (err) {
    return handleRouteError(err);
  }
}
