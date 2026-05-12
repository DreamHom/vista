import { NextRequest, NextResponse } from "next/server";
import * as Verification from "@/lib/api/verification";
import type { RejectVerificationRequest } from "@/lib/api/types";
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
    const body = await readJsonBody<RejectVerificationRequest>(req);
    const verification = await Verification.adminRejectVerification(
      token,
      id,
      body,
    );
    return NextResponse.json(verification);
  } catch (err) {
    return handleRouteError(err);
  }
}
