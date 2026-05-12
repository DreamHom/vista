import { NextResponse } from "next/server";
import * as Admin from "@/lib/api/admin";
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
    await Admin.adminReactivateUser(token, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
