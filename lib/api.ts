import type { ProblemDetail } from "./types";

/**
 * Tiny fetch wrapper for the haven backend.
 *
 *  - Resolves relative paths against {@link NEXT_PUBLIC_API_BASE_URL}.
 *  - Injects the JWT bearer from the auth store when present (wired in app-providers).
 *  - JSON-encodes bodies and parses JSON responses.
 *  - Surfaces non-2xx responses as {@link ApiError} carrying the parsed RFC 7807 body.
 *  - Surfaces network failures as {@link NetworkError}.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

/** Resolve the JWT to attach to outgoing requests. Overridden at runtime by the auth store. */
let getAuthToken: () => string | null = () => null;

export function setAuthTokenProvider(provider: () => string | null): void {
  getAuthToken = provider;
}

/** Thrown for any non-2xx response. Carries the HTTP status and parsed problem body. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail | null;

  constructor(status: number, problem: ProblemDetail | null, fallbackMessage?: string) {
    super(problem?.detail ?? problem?.title ?? fallbackMessage ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }

  /** True for 401 — caller should clear stored token and bounce to /login. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True for 400/422 — caller should surface field-level errors on the form. */
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

/** Thrown when the network request itself fails (offline, DNS, CORS, etc.). */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super("Network request failed");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  /** Request body — will be JSON-serialised. Omit for GET/DELETE. */
  body?: unknown;
  /** Skip attaching the bearer token even if one is available. */
  skipAuth?: boolean;
  /** Query-string params, appended to the URL. */
  query?: Record<string, string | number | boolean | undefined | null>;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, query, headers, ...rest } = options;

  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  // 204 No Content → return undefined (the caller's T should reflect this).
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const parsed = text.length > 0 ? safeParseJson(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, parsed as ProblemDetail | null, response.statusText);
  }

  return parsed as T;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};
