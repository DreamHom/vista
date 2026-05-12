import { NextRequest, NextResponse } from "next/server";
import * as Assignments from "@/lib/api/agent-assignments";
import type { RevokeAssignmentRequest } from "@/lib/api/types";
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
    const body = await readJsonBody<RevokeAssignmentRequest>(req);
    const assignment = await Assignments.revokeAssignment(token, id, body);
    return NextResponse.json(assignment);
  } catch (err) {
    return handleRouteError(err);
  }
}
