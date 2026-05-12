import { NextRequest, NextResponse } from "next/server";
import * as Inspections from "@/lib/api/inspections";
import type { CreateSlotRequest } from "@/lib/api/types";
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
    const slots = await Inspections.listListingSlots(id);
    return NextResponse.json(slots);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;
  try {
    const body = await readJsonBody<CreateSlotRequest>(req);
    const slot = await Inspections.createSlot(token, id, body);
    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
