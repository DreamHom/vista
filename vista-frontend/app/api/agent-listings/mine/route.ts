import { NextResponse } from "next/server";
import * as Assignments from "@/lib/api/agent-assignments";
import {
  handleRouteError,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET() {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const assignments = await Assignments.listMyAssignments(token);
    return NextResponse.json(assignments);
  } catch (err) {
    return handleRouteError(err);
  }
}
