import { NextResponse } from "next/server";
import * as Admin from "@/lib/api/admin";
import {
  handleRouteError,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;
  try {
    const listing = await Admin.adminApproveListing(token, id);
    return NextResponse.json(listing);
  } catch (err) {
    return handleRouteError(err);
  }
}
