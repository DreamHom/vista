import { NextRequest, NextResponse } from "next/server";
import * as Inspections from "@/lib/api/inspections";
import type { RequestInspectionRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<RequestInspectionRequest>(req);
    const inspection = await Inspections.requestInspection(token, body);
    return NextResponse.json(inspection, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
