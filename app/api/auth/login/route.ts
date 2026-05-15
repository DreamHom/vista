import type { NextRequest } from "next/server";
import { proxyToHaven } from "@/lib/haven-proxy";

export async function POST(request: NextRequest) {
  return proxyToHaven(request, ["auth", "login"]);
}
