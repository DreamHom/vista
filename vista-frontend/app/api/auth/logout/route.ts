import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as Auth from "@/lib/api/auth";
import { AUTH_COOKIE } from "@/lib/api/session";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;

  if (token) {
    try {
      await Auth.logout(token);
    } catch {
      // ignore — we still want to clear the cookie locally
    }
  }

  jar.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
