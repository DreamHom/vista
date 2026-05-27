"use client";

/**
 * Refresh token flow — wired against Haven OpenAPI v1.0.4 `/auth/refresh`.
 *
 * Contract (haven-api-docs-1.0.4.yaml lines 2844-2895, 7705-7738):
 *   - POST /auth/refresh, `security: []` (no bearer attached)
 *   - Request: { refreshToken: string }   (RefreshTokenRequest, required field)
 *   - 200: LoginResponse — full shape with the rotated refresh token
 *   - 400: ValidationFailed problem (our request was malformed)
 *   - 401: Unauthenticated — token unknown/expired/revoked/replayed OR account
 *          suspended. All terminal: no retry path from the frontend.
 *
 * Rotation is mandatory per the docs: every successful refresh issues a new
 * refresh string and invalidates the old one. If we ever replay the old one,
 * haven revokes the entire forward chain on the assumption that a copy leaked.
 * So: every 200 response MUST overwrite our stored refresh token atomically.
 *
 * If refresh fails terminally, we clear the session and signal the app via
 * AUTH_EXPIRED_EVENT so the layout routes the user to /login.
 */

import { ApiError, NetworkError } from "@/lib/api";
import { useAuthStore, getCurrentRefreshToken } from "@/lib/auth-store";
import type { LoginResponse, RefreshTokenRequest, Role } from "@/lib/types";

/**
 * Fired on `window` when the session terminally expired (refresh failed or
 * we never had a refresh token to begin with). Layout listens and routes to
 * /login?next=<current path>.
 */
export const AUTH_EXPIRED_EVENT = "dreamhomes:auth-expired";

let inflight: Promise<string | null> | null = null;

/**
 * Exchange the stored refresh token for a fresh access JWT. Returns the new
 * token, or null if there's no refresh token or the exchange failed.
 *
 * Coalesces concurrent calls — if 5 requests 401 simultaneously, we only POST
 * to /auth/refresh once and all 5 await the same promise.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (inflight) return inflight;
  inflight = doRefresh().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = getCurrentRefreshToken();
  if (!refreshToken) return null;

  // Direct fetch (not via lib/api) to avoid recursion: a 401 here cannot
  // trigger another refresh attempt. Body shape mirrors RefreshTokenRequest
  // from the OpenAPI schema verbatim.
  const requestBody: RefreshTokenRequest = { refreshToken };

  let response: Response;
  try {
    const url = typeof window !== "undefined" ? new URL("/api/auth/refresh", window.location.origin) : null;
    if (!url) return null;
    response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, application/problem+json",
      },
      // `security: []` per the docs — we deliberately do NOT attach a bearer.
      // The refresh token in the body is the credential.
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    // Network error — leave the session intact. A transient blip shouldn't
    // log the user out; they can retry on the next action.
    void err;
    return null;
  }

  if (response.status === 401) {
    // Terminal per docs: token is unknown / expired / revoked / replayed, or
    // the account was suspended. No retry path.
    clearSessionAndEmitExpired();
    return null;
  }

  if (response.status === 400) {
    // ValidationFailed — we sent a malformed request. Shouldn't happen with
    // our typed body; if it does, treat as terminal so we don't loop.
    clearSessionAndEmitExpired();
    return null;
  }

  if (!response.ok) {
    // 5xx or anything else: don't clear the session, but don't return a token
    // either. Caller falls through to the original error.
    return null;
  }

  let payload: LoginResponse | null = null;
  try {
    payload = (await response.json()) as LoginResponse;
  } catch {
    clearSessionAndEmitExpired();
    return null;
  }

  // The contract says LoginResponse, but no fields are strictly `required` in
  // the schema, so we validate the ones we actually depend on at runtime.
  if (
    !payload ||
    typeof payload.token !== "string" ||
    !payload.token.trim() ||
    typeof payload.refreshToken !== "string" ||
    !payload.refreshToken.trim()
  ) {
    clearSessionAndEmitExpired();
    return null;
  }

  // Reconcile the stored user with what haven returned. Identity fields
  // (`role`, `fullName`) can drift if admin edited the account between login
  // and refresh; the refresh response is the freshest source. We keep email
  // and profileImageUrl from the existing user because haven's refresh
  // response doesn't carry them.
  const store = useAuthStore.getState();
  if (!store.user) {
    clearSessionAndEmitExpired();
    return null;
  }

  const mergedUser = {
    ...store.user,
    id: typeof payload.userId === "number" ? payload.userId : store.user.id,
    role: isValidRole(payload.role) ? payload.role : store.user.role,
    fullName:
      typeof payload.fullName === "string" && payload.fullName.trim()
        ? payload.fullName.trim()
        : store.user.fullName,
  };

  store.setSession(payload.token, mergedUser, payload.refreshToken);
  return payload.token;
}

function isValidRole(value: unknown): value is Role {
  return value === "OWNER" || value === "AGENT" || value === "APPLICANT" || value === "ADMIN";
}

/**
 * Clear the session and dispatch the expired-event so the layout can route
 * the user to /login. Safe to call multiple times (clear is idempotent).
 */
export function clearSessionAndEmitExpired(): void {
  useAuthStore.getState().clear();
  if (typeof window !== "undefined") {
    const event = new CustomEvent(AUTH_EXPIRED_EVENT, {
      detail: { nextPath: window.location.pathname + window.location.search },
    });
    window.dispatchEvent(event);
  }
}

/** Type guard used by the api.ts 401 retry path. */
export function isExpiredAccessError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 401;
}

/** Re-export so the api.ts retry path doesn't pull twice from lib/api. */
export { ApiError, NetworkError };
