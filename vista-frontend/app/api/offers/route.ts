import { NextRequest, NextResponse } from "next/server";
import * as Offers from "@/lib/api/offers";
import type { SubmitOfferRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<SubmitOfferRequest>(req);
    const offer = await Offers.submitOffer(token, body);
    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
