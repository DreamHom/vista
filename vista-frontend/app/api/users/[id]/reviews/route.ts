import { NextRequest, NextResponse } from "next/server";
import * as Users from "@/lib/api/users";
import { handleRouteError } from "@/app/api/_utils/route";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const reviews = await Users.getUserReviews(id);
    return NextResponse.json(reviews);
  } catch (err) {
    return handleRouteError(err);
  }
}
