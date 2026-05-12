import { NextRequest, NextResponse } from "next/server";
import * as Properties from "@/lib/api/properties";
import type { CreatePropertyRequest } from "@/lib/api/types";
import {
  handleRouteError,
  readJsonBody,
  requireTokenOrResponse,
} from "@/app/api/_utils/route";

export async function POST(req: NextRequest) {
  const token = await requireTokenOrResponse();
  if (token instanceof NextResponse) return token;

  try {
    const body = await readJsonBody<CreatePropertyRequest>(req);
    const property = await Properties.createProperty(token, body);
    return NextResponse.json(property, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
