import { NextRequest, NextResponse } from "next/server";
import * as Verification from "@/lib/api/verification";
import type { SubmitVerificationRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<SubmitVerificationRequest>(req);
    const verification = await Verification.submitVerification(token, body);
    return NextResponse.json(verification, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
