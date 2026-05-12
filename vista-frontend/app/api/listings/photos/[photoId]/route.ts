import { NextResponse } from "next/server";
import * as Listings from "@/lib/api/listings";
import {
  handleRouteError,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ photoId: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { photoId } = await ctx.params;
  try {
    await Listings.deleteListingPhoto(token, photoId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
