import { NextRequest, NextResponse } from "next/server";
import * as Comments from "@/lib/api/comments";
import type { PostCommentRequest } from "@/lib/api/types";
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
    const comments = await Comments.listListingComments(id);
    return NextResponse.json(comments);
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
    const body = await readJsonBody<PostCommentRequest>(req);
    const comment = await Comments.postComment(token, id, body);
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
