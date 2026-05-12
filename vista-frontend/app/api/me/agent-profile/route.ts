import { NextRequest, NextResponse } from "next/server";
import * as Auth from "@/lib/api/auth";
import type { UpdateAgentProfileRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function PATCH(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<UpdateAgentProfileRequest>(req);
    const profile = await Auth.updateMyAgentProfile(token, body);
    return NextResponse.json(profile);
  } catch (err) {
    return handleRouteError(err);
  }
}
