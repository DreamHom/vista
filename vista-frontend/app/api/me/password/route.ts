import { NextRequest, NextResponse } from "next/server";
import * as Auth from "@/lib/api/auth";
import type { ChangePasswordRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<ChangePasswordRequest>(req);
    await Auth.changeMyPassword(token, body);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
