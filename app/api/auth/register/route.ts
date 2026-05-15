import type { NextRequest } from "next/server";
import { proxyToHaven } from "@/lib/haven-proxy";

/** Explicit POST handler so `/api/auth/register` always proxies to Haven (not blocked by a stale route). */
export async function POST(request: NextRequest) {
  return proxyToHaven(request, ["auth", "register"]);
}
