import { NextResponse } from "next/server";
import * as Comments from "@/lib/api/comments";
import {
  handleRouteError,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { id } = await ctx.params;
  try {
    await Comments.deleteComment(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
