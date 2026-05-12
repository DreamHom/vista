import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as Auth from "@/lib/api/auth";
import { HavenError } from "@/lib/api/http";
import { AUTH_COOKIE } from "@/lib/api/session";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: 400, title: "Bad Request", detail: "Expected JSON body." },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  const { email, password } = (body ?? {}) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json(
      {
        status: 400,
        title: "Validation failed",
        detail: "Email and password are required.",
      },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  try {
    const { token } = await Auth.login({ email, password });
    const me = await Auth.me(token);
    const jar = await cookies();
    jar.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h — matches backend JWT TTL
    });
    return NextResponse.json({ user: me });
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
