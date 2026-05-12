import { NextRequest, NextResponse } from "next/server";
import { HavenError } from "@/lib/api/http";
import { getToken } from "@/lib/api/session";

export function problemJson(
  status: number,
  title: string,
  detail?: string,
): NextResponse {
  return NextResponse.json(
    { status, title, ...(detail ? { detail } : {}) },
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
}

export function handleRouteError(err: unknown): NextResponse {
  if (err instanceof HavenError) {
    return NextResponse.json(err.problem, {
      status: err.status,
      headers: { "Content-Type": "application/problem+json" },
    });
  }

  return problemJson(
    500,
    "Internal Server Error",
    err instanceof Error ? err.message : "Unknown error",
  );
}

export async function readJsonBody<T>(req: NextRequest): Promise<T> {
  return (await req.json()) as T;
}

export async function requireTokenOrResponse(): Promise<string | NextResponse> {
  const token = await getToken();
  return token ?? problemJson(401, "Unauthorized");
}

export function parseNumberParam(
  value: string | null,
  fallback: number,
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
