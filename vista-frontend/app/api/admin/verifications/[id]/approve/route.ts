import { NextResponse } from "next/server";
import * as Verification from "@/lib/api/verification";
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
    const verification = await Verification.adminApproveVerification(token, id);
    return NextResponse.json(verification);
  } catch (err) {
    return handleRouteError(err);
  }
}
