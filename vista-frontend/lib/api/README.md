# Vista ↔ haven API integration

This folder is the only place that knows how to talk to the **haven** Java
backend. Everywhere else in the app imports server-side helpers, server actions
or Next.js route handlers — never `fetch("http://localhost:8080…")` directly.

## Wiring overview

```
browser ──▶ Next.js route handlers (app/api/*)
                 │
                 ├──▶ Server actions (lib/actions/*) ──▶ lib/api/*  ──▶  haven
                 │
Server Components ─────────────────────────────────────▶  lib/api/*  ──▶  haven
```

- Public reads (`GET /api/listings`, `…/{id}`, photos, comments, reviews,
  user profiles, reviews) are called directly from Server Components.
- Authenticated reads/writes go through Server Actions in `lib/actions/*`
  which read the JWT from an httpOnly cookie via `getToken()`.
- Browser code (forms, polling) hits Next.js routes in `app/api/*` which
  forward to haven with the cookie's Bearer token attached server-side.

## Environment

Copy `.env.example` to `.env.local` at the repo root and tweak as needed:

| Variable | Default | Notes |
|----|----|----|
| `HAVEN_API_URL` | `http://localhost:8080` | Base URL of the Java service. Never exposed to the browser. |
| `HAVEN_AUTH_COOKIE` | `dh_session` | Name of the httpOnly cookie holding the JWT. |

## Auth flow

1. The browser submits `/api/auth/login` (Next.js route handler).
2. The route calls `POST /api/auth/login` against haven, receives `{ token }`.
3. We set `HAVEN_AUTH_COOKIE` (httpOnly, sameSite=lax, secure in prod, 1 h TTL —
   matches the JWT lifetime).
4. Server-side calls read that cookie with `getToken()` and add
   `Authorization: Bearer <jwt>` to outbound requests.
5. Browser never sees the JWT. Logout clears the cookie and calls
   `POST /api/auth/logout`.

> JWT expiry is 1 h. Anywhere we hit haven and get **401**, the helper
> route handlers treat it as anonymous so the UI prompts re-login (see
> `app/api/me/route.ts`).

## Pagination / cache / errors

- Spring `Page<T>` envelope is reflected in `types.ts` as `Page<T>`.
- Public reads use `revalidate: 30` + tags so admin/owner mutations can
  call `revalidateTag('listings')` / `revalidateTag('listing:{id}')` to
  invalidate the public ISR cache.
- Errors map onto `HavenError` carrying the `application/problem+json`
  envelope verbatim. UI surfaces `problem.detail ?? problem.title`.
- 409 (`@Version` optimistic lock conflicts) bubble up as HavenError —
  surface "Reload and try again" on Listing/Offer/Verification screens.

## What is currently wired

| Page | Endpoint(s) |
|----|----|
| `GET /listings` | `GET /api/listings` (paginated) |
| `GET /listings/[id]` | `GET /api/listings/{id}` + photos + comments + slots + owner & agent profiles + my saves |
| `POST` comment | `POST /api/listings/{id}/comments` (server action) |
| Save / unsave | `POST/DELETE /api/listings/{id}/save` (server action) |
| `GET /listings/[id]/inspect` | `GET /api/listings/{id}/slots` + `POST /api/inspections` |
| `GET /listings/[id]/offer` | `POST /api/offers` |
| `GET /agents/[id]` | `GET /api/users/{id}/profile` + `…/reviews` |
| `/login`, `/register/*` | proxy → `POST /api/auth/login`, `…/register`, `…/logout` |
| `/dashboard/saved` | `GET /api/saves/mine` |
| `/dashboard/verification` | `POST /api/verifications` |
| Owner — new listing | `POST /api/properties` → `POST /api/listings` |
| Owner — listing detail | `GET /api/listings/{id}` + photos + multipart photo upload |
| Admin — verifications | `GET /api/admin/verifications` + approve / reject |
| Admin — listings | `GET /api/listings` + admin approve / takedown |
| Admin — analytics | `GET /api/admin/analytics/summary` |
| Notifications bell | `/api/notifications/mine`, `…/unread-count`, `…/{id}/mark-read` (Next.js proxies → haven) |