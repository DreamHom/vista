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

**1. Editorial real-estate aesthetic, not generic SaaS.** Sharp corners (`--radius: 0`), hairline borders, one accent ≤10% of any view, SF Pro as the single sans family. The goal is for it to read like a real-estate magazine, not a dashboard template — and to fail the "AI made that" sniff test.

**2. Apollo-flat code layout.** Three top-level buckets: `app/` (URLs only), `components/{ui,layout,providers,…}` (anything that renders), `lib/` (flat — no nested `hooks/` or `features/`). Keeps the file tree shallow and makes things easy to find without inventing abstractions that aren't earned.

**3. Single proxy hop through Next, never direct to haven.** All `/api/*` calls go through `app/api/[...path]/route.ts` to haven with a forced `User-Agent` (Cloudflare's bot-fight 403s undici's default of no UA). Gives one place to add request shaping, cookie handling, retry policy without touching every call site.

**4. JWT + refresh-token rotation with one retry.** Haven issues `token` (1h) + `refreshToken` (30d, rotated). On any 401 the API client transparently calls `/auth/refresh` and retries the original request once; concurrent 401s coalesce on one refresh promise. Tokens live in localStorage — known XSS exposure, accepted for capstone scope; production would move to httpOnly cookies (haven supports this server-side).

**5. Realtime notifications via SSE.** `/notifications/stream` is one persistent connection per tab. Each Kafka or sync event fires a top-right toast, invalidates the relevant TanStack Query keys, and bumps the bell-badge count — so opening two tabs (applicant + owner) shows the full Kafka pipeline working in seconds with no refresh. Uses `fetch` + `ReadableStream` because native `EventSource` can't carry our bearer header.

**6. Two-step presigned R2 uploads for photos.** Vista mints a presigned PUT URL via haven, the browser uploads the file directly to R2, then confirms. Photos never round-trip through haven. Errors are typed (`PresignedR2UploadError`) so an R2 CORS misconfiguration surfaces as a real diagnostic instead of an unrelated 413 from a stale fallback endpoint.

## License

Built for Moniepoint DreamDev Bootcamp 2026. All product copy and brand marks are DreamHomes-specific.
