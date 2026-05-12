import { NextRequest, NextResponse } from "next/server";
import * as Auth from "@/lib/api/auth";
import type { RegisterRequest, Role } from "@/lib/api/types";
import { HavenError } from "@/lib/api/http";

const VALID_ROLES: Role[] = ["APPLICANT", "OWNER", "AGENT"];

export async function POST(req: NextRequest) {
  let body: Partial<RegisterRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: 400, title: "Bad Request", detail: "Expected JSON body." },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  const { email, password, fullName, role, displayName, phone } = body;
  if (
    !email ||
    !password ||
    !fullName ||
    !role ||
    !VALID_ROLES.includes(role)
  ) {
    return NextResponse.json(
      {
        status: 400,
        title: "Validation failed",
        detail:
          "email, password, fullName and a valid role (APPLICANT, OWNER, AGENT) are required.",
      },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  try {
    await Auth.register({
      email,
      password,
      fullName,
      role,
      displayName,
      phone,
    });
    // Backend returns 202 even for duplicates — surface ambiguous success message.
    return NextResponse.json(
      {
        ok: true,
        message:
          "If this email is new to DreamHomes, we just sent a verification link. Check your inbox.",
      },
      { status: 202 },
    );
  } catch (err) {
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
