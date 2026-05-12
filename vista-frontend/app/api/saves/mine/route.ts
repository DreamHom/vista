import { NextRequest, NextResponse } from "next/server";
import * as Saves from "@/lib/api/saves";
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
    const page = await Saves.listMySaves(
      token,
      parseNumberParam(searchParams.get("page"), 0),
      parseNumberParam(searchParams.get("size"), 20),
    );
    return NextResponse.json(page);
  } catch (err) {
    return handleRouteError(err);
  }
}
