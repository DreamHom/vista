import type { NextRequest } from "next/server";

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api";

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "origin",
  "referer",
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

export function buildHavenUrl(path: string[], searchParams: URLSearchParams) {
  const joinedPath = path.join("/");
  const normalizedBase = BACKEND_API_BASE_URL.replace(/\/$/, "");
  const url = new URL(`${normalizedBase}/${joinedPath}`);

  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
}

export function buildHavenRequestHeaders(request: NextRequest) {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json, application/problem+json");
  }

  // Cloudflare bot-fight on Haven returns 403 when User-Agent is missing (server-side fetch).
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "dreamhomes-vista/1.0 (+https://www.dreamhomes.today)");
  }

  return headers;
}

function buildHavenResponseHeaders(proxyResponse: Response) {
  const headers = new Headers();

  proxyResponse.headers.forEach((value, key) => {
    if (HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });

  return headers;
}

/** Proxy a Next `/api/*` request to Haven (`NEXT_PUBLIC_API_BASE_URL`). */
export async function proxyToHaven(request: NextRequest, path: string[]) {
  const targetUrl = buildHavenUrl(path, request.nextUrl.searchParams);
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const proxyResponse = await fetch(targetUrl, {
    method,
    headers: buildHavenRequestHeaders(request),
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers: buildHavenResponseHeaders(proxyResponse),
  });
}
