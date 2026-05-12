/**
 * Low-level HTTP helpers for talking to haven.
 *
 * Server-only — DO NOT import from a "use client" file. Browser code should go
 * through Next.js route handlers (app/api/*) so the JWT stays in an httpOnly
 * cookie and the backend URL never leaks to the client bundle.
 */

import type { ProblemDetail } from "./types";

export const HAVEN_BASE_URL =
  process.env.HAVEN_API_URL ?? "http://localhost:8080";

export class HavenError extends Error {
  status: number;
  problem: ProblemDetail;
  constructor(problem: ProblemDetail) {
    super(problem.title || problem.detail || `HTTP ${problem.status}`);
    this.name = "HavenError";
    this.status = problem.status;
    this.problem = problem;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Raw JWT — when calling on behalf of a user. */
  token?: string;
  /** Override fetch caching. Server Components default to "force-cache". */
  cache?: RequestCache;
  /** Set to a tag list when you want on-demand revalidation. */
  tags?: string[];
  /** Seconds; passes through to Next.js `revalidate`. */
  revalidate?: number | false;
  /** Set true for FormData body (e.g. photo upload). */
  multipart?: boolean;
  /** Optional query params (object). */
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    HAVEN_BASE_URL,
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

/**
 * Core request. Throws `HavenError` on non-2xx (problem+json shaped).
 * Returns null for 204; otherwise parses JSON.
 */
export async function havenFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.multipart && opts.body instanceof FormData) {
      body = opts.body;
      // do NOT set Content-Type — the browser/Node sets the boundary
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  const init: RequestInit & { next?: { tags?: string[]; revalidate?: number | false } } = {
    method: opts.method ?? "GET",
    headers,
    body,
  };
  if (opts.cache) init.cache = opts.cache;
  if (opts.tags || opts.revalidate !== undefined) {
    init.next = {};
    if (opts.tags) init.next.tags = opts.tags;
    if (opts.revalidate !== undefined) init.next.revalidate = opts.revalidate;
  }

  const res = await fetch(buildUrl(path, opts.query), init);

  if (res.status === 204) {
    return null as T;
  }

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const problem: ProblemDetail =
      data && typeof data === "object"
        ? (data as ProblemDetail)
        : { status: res.status, title: res.statusText };
    if (!problem.status) problem.status = res.status;
    throw new HavenError(problem);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Helpful for forwarding 4xx body verbatim from Next.js route handlers. */
export function problemResponse(err: unknown): Response {
  if (err instanceof HavenError) {
    return new Response(JSON.stringify(err.problem), {
      status: err.status,
      headers: { "Content-Type": "application/problem+json" },
    });
  }
  return new Response(
    JSON.stringify({
      status: 500,
      title: "Internal Server Error",
      detail: err instanceof Error ? err.message : "Unknown error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
}
