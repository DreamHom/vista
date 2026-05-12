import { NextRequest, NextResponse } from "next/server";
import * as Verification from "@/lib/api/verification";
import type { VerificationTrack } from "@/lib/api/types";
import {
  handleRouteError,
  parseNumberParam,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  const { searchParams } = new URL(req.url);
  try {
    const type =
      (searchParams.get("type") as VerificationTrack | null) ??
      "OWNER_IDENTITY";
    const verifications = await Verification.adminListVerifications(
      token,
      type,
      parseNumberParam(searchParams.get("page"), 0),
      parseNumberParam(searchParams.get("size"), 20),
    );
    return NextResponse.json(verifications);
  } catch (err) {
    return handleRouteError(err);
  }
}
