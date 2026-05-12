import { NextRequest, NextResponse } from "next/server";
import * as Reviews from "@/lib/api/reviews";
import type { PostReviewRequest } from "@/lib/api/types";
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
    const reviews = await Reviews.listListingReviews(id);
    return NextResponse.json(reviews);
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
    const body = await readJsonBody<PostReviewRequest>(req);
    const review = await Reviews.postReview(token, id, body);
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
