import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as Auth from "@/lib/api/auth";
import { getToken } from "@/lib/api/session";
import { HavenError } from "@/lib/api/http";
import { handleRouteError, readJsonBody } from "@/app/api/_utils/route";
import type { UpdateMeRequest } from "@/lib/api/types";

export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const me = await Auth.me(token);
    return NextResponse.json({ user: me });
  } 
  
  catch (err) {
    if (err instanceof HavenError && err.status === 401) {
      // JWT expired / revoked — treat as anonymous so the UI can prompt re-login
      return NextResponse.json({ user: null }, { status: 200 });
    }
    if (err instanceof HavenError) {
      return NextResponse.json(err.problem, {
        status: err.status,
        headers: { "Content-Type": "application/problem+json" },
      });
    }
    return NextResponse.json(
      {
        status: 500,
        title: "Internal Server Error",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500, headers: { "Content-Type": "application/problem+json" } },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { status: 401, title: "Unauthorized" },
      { status: 401, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  try {
    const body = await readJsonBody<UpdateMeRequest>(req);
    const profile = await Auth.updateMe(token, body);
    return NextResponse.json(profile);
  } catch (err) {
    return handleRouteError(err);
  }
}
