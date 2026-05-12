import { NextRequest, NextResponse } from "next/server";
import * as Saves from "@/lib/api/saves";
import type { ReportListingRequest } from "@/lib/api/types";
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
    const body = await readJsonBody<ReportListingRequest>(req);
    await Saves.reportListing(token, id, body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
