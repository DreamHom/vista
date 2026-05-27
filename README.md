# DreamHomes Vista — The Portal 🌅

> The window into DreamHomes. Where owners list, agents manage, and applicants find their next home.

## What This Is

Vista is the Next.js 16 frontend for [DreamHomes](https://www.dreamhomes.today), a property platform connecting Nigerian property owners, real-estate agents, and applicants. Owners list and manage properties, agents handle listings on their behalf, applicants discover and apply. Companion backend (`haven`) is Spring Boot 3 / Java 21 / Postgres / Kafka.

Built for the **Moniepoint DreamDev Bootcamp 2026** capstone. Vision: *making dreams come true, one home at a time.*

Four authenticated surfaces sit on top of the public catalogue:

- **`/dashboard/*`** — applicants. Saved listings, inspection requests, offers, profile.
- **`/owner/*`** — owners. Property records, listings, agent assignments, incoming offers.
- **`/agent/*`** — agents. Managed listings, owner relationships, leads, offer pipeline.
- **`/haven/*`** — DreamHomes platform admins. Verifications, reports, content moderation.

The public catalogue (`/`, `/listings`, `/agents`, `/dream-ai`, `/map`, `/compare`) is browseable signed-out; engagement actions (save, comment, request inspection, submit offer) prompt sign-in inline.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind 3 + CSS variables, sharp-cornered shadcn-style primitives |
| Type | SF Pro variable, subset to Latin/Cyrillic/Arabic/Devanagari (~1.5 MB combined woff2) |
| State | Zustand (auth, persisted), TanStack Query (server state) |
| Forms | react-hook-form + Zod |
| API | Custom `lib/api.ts` client with refresh-token rotation, RFC 7807 error parsing |
| Toasts | Sonner |
| Icons | lucide-react |
| Realtime | Server-Sent Events over `fetch`/`ReadableStream` (notifications stream) |
| Maps | Leaflet (`lib/seed/listing-map-points`) |
| Tooling | pnpm 9+, Node 20, Husky pre-push preflight (typecheck + lockfile + binary asset check) |

## Getting Started

```bash
# 1. Clone + install
git clone https://github.com/DreamHom/vista.git
cd vista
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — at minimum:
#   NEXT_PUBLIC_API_BASE_URL  (haven backend, defaults to production)
#   NEXT_PUBLIC_SITE_URL      (canonical origin)

# 3. Run dev server
pnpm dev
# → http://127.0.0.1:3000
```

**Scripts:**

| Script | What it does |
|---|---|
| `pnpm dev` | Next dev server with Turbopack |
| `pnpm build` | Production build (Next `output: "standalone"`) |
| `pnpm start` | Run the production build |
| `pnpm lint` | Next ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm preflight` | The pre-push gate (binary assets, lockfile sync, typecheck) |

**Pre-push protection.** A Husky `pre-push` hook runs `pnpm preflight` before any push to remote. It blocks pushes that would obviously fail on Vercel: empty binary assets (icons / fonts mangled by IDE local-history reverts), drifted lockfiles, type errors. Bypass for emergencies with `SKIP_PREFLIGHT=1 git push`.

**Node version:** see `.nvmrc` (Node 20). `nvm use` if you have nvm.

## Project Structure

Apollo-flat layout (refactored 2026-05-08). Three top-level buckets, each kept shallow:

```
app/                  URLs only — every folder is a route segment
  (public)/           Marketing + browse (landing, listings, agents, dream-ai, ...)
  dashboard/          Applicant role
  owner/              Owner role
  agent/              Agent role
  haven/              Platform admin role
  api/                Next API routes (proxy to haven, auth, etc.)

components/           Everything that renders (kebab-case filenames)
  ui/                 Sharp-cornered primitives (button, badge, dialog, input, ...)
  nexus-ui/           Ports of Nexus UI for the Dream AI surface
  layout/             Shells, headers, account menus, notification bell
  providers/          Context + global side-effect mounts (query, auth refresh, SSE stream)
  dashboard/          Applicant pages
  owner/              Owner pages
  agent/              Agent pages
  admin/              Platform admin pages
  public/             Public catalogue (browse, listings detail, agent directory, map)
  dream-ai/           Conversational property search

lib/                  Flat. No nested folders.
  api.ts              Fetch wrapper + refresh-token retry + RFC 7807 parsing
  auth-store.ts       Zustand store (persisted)
  auth-refresh.ts     Rotation against haven's /auth/refresh
  applicant-dashboard.ts / owner-dashboard.ts / agent-dashboard.ts / admin-dashboard.ts
  notifications-stream.ts   SSE client for /notifications/stream
  photo-upload-errors.ts    Per-file 413/415/422/CORS message mapping
  seed/                     Public data + photo helpers
  dream-ai/                 Dream AI contracts + heuristic matcher + SSE turn stream
```

What's **not** here: no `features/`, no top-level `types/`, no `hooks/`. Hooks live as `use-*.ts` next to their domain in `lib/`. Types live in `lib/types.ts` or alongside their domain client.

## Key Design Decisions

These are the non-obvious choices a reviewer would want explained.

### Editorial real-estate aesthetic over generic SaaS

Color strategy is **Restrained**: tinted neutrals across the surface, with brand blue used as accent ≤10% of any view. Sharp corners everywhere (`--radius: 0`), hairline `border-border` dividers, no shadows by default, no glassmorphism, no gradient text. SF Pro is the single sans family for everything (no display/body pairing). The slop test the design has to pass: a user fluent in real-estate listings should believe a magazine publisher built this, not that ChatGPT did.

### Vista talks to haven via Next API proxy

The browser never calls `haven.dreamhomes.today` directly. All `/api/*` requests hit `app/api/[...path]/route.ts`, which proxies to haven with a forced `User-Agent` (Cloudflare's bot-fight in front of haven 403s undici's default of no UA). This also gives us one place to add request shaping, cookie handling, etc. without touching every call site.

### JWT + refresh-token rotation

Haven issues `token` (1h JWT) + `refreshToken` (30d, rotated). On any 401, the API client transparently calls `/auth/refresh` and retries the original request once. Concurrent 401s coalesce on a single refresh promise so a burst of failed requests fires one refresh, not five. If refresh itself 401s (replay-detected, revoked, or account suspended), the session clears and a window event routes the user to `/login?next=<current>`.

### Real-time notifications via SSE, not polling

`/api/notifications/stream` is opened once per tab while authenticated. Every Kafka or sync notification arrives within milliseconds. Each event fires a top-right toast with a role-aware deep link, invalidates the relevant TanStack Query keys, and bumps the bell badge unread count optimistically. Native `EventSource` doesn't support headers, so the stream uses `fetch` + `ReadableStream` + manual SSE block parsing (mirrors the Dream AI stream pattern). Exponential backoff reconnect; stops permanently on 401 so the refresh flow can recover.

### Two-step presigned R2 uploads for photos

Photos don't pass through haven or vista. Vista calls `POST /listings/{id}/photos/upload-url` to mint a presigned R2 URL, the browser PUTs the file directly to R2, then vista confirms via `POST /listings/{id}/photos/confirm`. Errors are typed (`PresignedR2UploadError`) so CORS misconfiguration on R2 surfaces as a distinct, actionable message instead of a confusing fallback 413.

### Role-aware deep links from one resolver

`getNotificationHref(notification, role)` routes notifications to the right tree based on the recipient's role. Owners clicking an inspection notification land on `/owner/inspections`, applicants on `/dashboard/inspections`, agents on `/agent/inspections`. Without role awareness, the applicant-only `/dashboard/*` guard would bounce owners to the dashboard home, looking like the link did nothing.

### Realtime UI without the orchestration

When Kafka fires `INSPECTION_REQUESTED` or `OFFER_SUBMITTED`, the SSE stream pushes the notification, which invalidates not just the notifications query but the inspections / offers queries on whatever role-specific page might be open. Two tabs side-by-side (applicant in one, owner in the other) show the full Kafka pipeline in seconds without anyone refreshing.

### Auth/session safety over feel-good UX

- 401 handling is centralized (refresh-and-retry, then bounce to login); no per-component "session expired" toasts.
- Mark-read mutations explicitly invalidate the unread-count cache so the bell never lies.
- Form-draft state is preserved across photo / document upload failures so users don't lose their work to a network blip on step 3 of 4.

## License

Built for Moniepoint DreamDev Bootcamp 2026. All product copy and brand marks are DreamHomes-specific.
