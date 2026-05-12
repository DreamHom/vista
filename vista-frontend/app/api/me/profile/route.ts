import { NextRequest, NextResponse } from "next/server";
import * as Auth from "@/lib/api/auth";
import type { UpdateMeRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET() {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const profile = await Auth.meProfile(token);
    return NextResponse.json(profile);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<UpdateMeRequest>(req);
    const profile = await Auth.updateMe(token, body);
    return NextResponse.json(profile);
  } catch (err) {
    return handleRouteError(err);
  }
}
