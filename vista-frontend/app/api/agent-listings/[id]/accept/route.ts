import { NextResponse } from "next/server";
import * as Assignments from "@/lib/api/agent-assignments";
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
    const assignment = await Assignments.acceptAssignment(token, id);
    return NextResponse.json(assignment);
  } catch (err) {
    return handleRouteError(err);
  }
}
