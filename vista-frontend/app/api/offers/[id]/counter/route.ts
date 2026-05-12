import { NextRequest, NextResponse } from "next/server";
import * as Offers from "@/lib/api/offers";
import type { CounterOfferRequest } from "@/lib/api/types";
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
    const body = await readJsonBody<CounterOfferRequest>(req);
    const offer = await Offers.counterOffer(token, id, body);
    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
