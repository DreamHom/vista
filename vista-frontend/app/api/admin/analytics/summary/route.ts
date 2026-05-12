import { NextResponse } from "next/server";
import * as Admin from "@/lib/api/admin";
import {
  handleRouteError,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function GET() {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const summary = await Admin.adminAnalyticsSummary(token);
    return NextResponse.json(summary);
  } catch (err) {
    return handleRouteError(err);
  }
}
