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

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://haven.dreamhomes.today/api";

function getBaseUrl() {
  // Browser requests go through Next rewrites so the app and API share one origin.
  if (typeof window !== "undefined") {
    return "/api";
  }

  return SERVER_BASE_URL;
}

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

  /** True for 401: caller should clear stored token and bounce to /login. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True for 400/422: caller should surface field-level errors on the form. */
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /** True for 409: stale version, illegal state transition, or other conflict. */
  get isConflict(): boolean {
    return this.status === 409;
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
  /**
   * Request body.
   *
   * Plain objects are JSON-serialised. `FormData`, `Blob`, `URLSearchParams`,
   * strings, and other native request bodies pass through untouched so upload
   * endpoints like haven v1.0.2's `POST /verifications/files` work without a
   * separate client.
   */
  body?: unknown;
  /** Skip attaching the bearer token even if one is available. */
  skipAuth?: boolean;
  /** Query-string params, appended to the URL. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /**
   * Skip the 401 → refresh → retry path. Set on the refresh request itself
   * and on /auth/login to avoid recursion. Internal use; callers shouldn't
   * normally need it.
   */
  skipRefreshRetry?: boolean;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, skipRefreshRetry, query, headers, ...rest } = options;

  const rawUrl = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;
  const url =
    typeof window !== "undefined" && rawUrl.startsWith("/")
      ? new URL(rawUrl, window.location.origin)
      : new URL(rawUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json, application/problem+json");
  // Server-side fetches: undici sends no default User-Agent when only Accept
  // is set, which Cloudflare's bot-fight in front of haven treats as a bot
  // and returns 403 (error 1010). Force a stable, identifiable UA so haven
  // logs can attribute the traffic and Cloudflare lets us through.
  // Skipped in the browser — Chrome's UA is already enforced and immutable.
  if (typeof window === "undefined" && !finalHeaders.has("User-Agent")) {
    finalHeaders.set("User-Agent", "dreamhomes-vista/1.0 (+https://www.dreamhomes.today)");
  }
  const bodyToSend = serializeBody(body, finalHeaders);

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: finalHeaders,
      body: bodyToSend,
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
    // 401 + we're in the browser + caller didn't opt out → try to refresh the
    // access token once and retry the original request. If refresh fails or
    // the retry still 401s, the original 401 bubbles up as before and the
    // session-expired event has already fired downstream.
    if (
      response.status === 401 &&
      !skipAuth &&
      !skipRefreshRetry &&
      typeof window !== "undefined"
    ) {
      const refreshed = await tryRefreshAndRetry<T>(method, path, {
        ...options,
        skipRefreshRetry: true,
      });
      if (refreshed.retried) return refreshed.value;
    }
    throw new ApiError(response.status, parsed as ProblemDetail | null, response.statusText);
  }

  return parsed as T;
}

/**
 * On a 401, attempt a single refresh-then-retry cycle. Returns `{ retried: true,
 * value }` when the retry succeeded; `{ retried: false }` when no refresh was
 * possible or the retry still failed (so the original 401 can be thrown by
 * the caller).
 *
 * Lives here (vs in lib/auth-refresh) because `request<T>` is module-local.
 */
async function tryRefreshAndRetry<T>(
  method: Method,
  path: string,
  options: RequestOptions,
): Promise<{ retried: true; value: T } | { retried: false }> {
  // Dynamic import to avoid a circular dep at module load time
  // (auth-refresh imports `ApiError` from this file).
  const { refreshAccessToken } = await import("./auth-refresh");
  const newToken = await refreshAccessToken();
  if (!newToken) return { retried: false };

  try {
    const value = await request<T>(method, path, options);
    return { retried: true, value };
  } catch {
    return { retried: false };
  }
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined;

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    typeof body === "string"
  ) {
    return body as BodyInit;
  }

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
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
