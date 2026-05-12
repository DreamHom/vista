# DreamHomes Vista — The Portal

> Making dreams come true, one home at a time.

Vista is the **frontend** of DreamHomes, a property platform that connects owners,
agents, and applicants in a transparent, trust-first environment — with Moniepoint-powered
home financing baked into discovery.

The companion backend lives in **haven**.

## What's inside

A full Next.js 16 (App Router) scaffold covering every surface in the PRD:

- **Public marketing**: landing, how-it-works, role-specific pages, about, trust & safety, pricing, contact, legal
- **Discovery**: listing search & detail, agent directory & profiles, Dream AI conversational page
- **Auth**: login, role-based register, forgot password, email verification
- **Applicant dashboard**: overview, saved, inspections, offers, messages, profile, verification
- **Owner workspace**: portfolio overview, listing CRUD, per-listing leads / inspections / offers, agent assignment, messages, verification, settings
- **Agent workspace**: overview, listings, leads, inspections, offers, messages, public profile, credentials, settings
- **Admin console**: overview, users, four-track verification queue, listings moderation, comments moderation, ads, analytics, immutable audit log

## Tech stack

| Layer        | Tool                                     |
|--------------|------------------------------------------|
| Framework    | Next.js 16 (App Router) + React 19       |
| Language     | TypeScript (strict)                      |
| Styling      | Tailwind CSS v4 (`@theme inline` tokens) |
| Fonts        | Geist Sans + Geist Mono via `next/font`  |
| Imagery      | Unsplash (whitelisted in `next.config`)  |

No external UI library — primitives live in `vista-frontend/components/ui/`.

## Project structure

```
vista/
├── README.md
├── LICENSE
└── vista-frontend/
    ├── app/
    │   ├── layout.tsx                    # root: fonts, metadata, base body
    │   ├── globals.css                   # design tokens (Tailwind v4)
    │   ├── not-found.tsx
    │   ├── error.tsx
    │   ├── (marketing)/                  # public pages + browse
    │   │   ├── layout.tsx                # marketing nav + footer
    │   │   ├── page.tsx                  # landing
    │   │   ├── about, how-it-works, for-{applicants,owners,agents},
    │   │   ├── trust-and-safety, pricing, contact, legal/{terms,privacy}
    │   │   ├── listings/
    │   │   │   ├── page.tsx              # /listings
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx          # listing detail
    │   │   │       ├── inspect/page.tsx
    │   │   │       └── offer/page.tsx
    │   │   ├── agents/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   └── dream/page.tsx            # Dream AI
    │   ├── (auth)/
    │   │   ├── layout.tsx                # split-screen brand panel
    │   │   ├── login, forgot-password, verify-email
    │   │   └── register/{,applicant,owner,agent}/page.tsx
    │   ├── (applicant)/                  # /dashboard/*
    │   ├── (owner)/                      # /owner/*
    │   ├── (agent)/                      # /agent/*
    │   └── (admin)/                      # /admin/*
    ├── components/
    │   ├── ui/                           # button, input, card, badge, avatar, …
    │   ├── icons.tsx                     # inline SVG icon set + Logo
    │   ├── marketing/                    # nav, footer
    │   ├── listings/                     # listing-card, filters
    │   ├── agents/                       # agent-card
    │   └── dashboard/                    # shell + sidebar
    └── lib/
        ├── constants.ts                  # brand, nav, footer, property types
        ├── types.ts                      # legacy view-model types
        ├── mock-data.ts                  # seeded fixtures (fallback only)
        ├── utils.ts                      # cn, currency, dates, initials
        ├── api/                          # haven HTTP client + DTOs + adapters
        │   ├── README.md                 # integration map + backend gaps
        │   ├── http.ts, session.ts, types.ts, adapters.ts
        │   └── auth, listings, users, inspections, offers, comments,
        │      saves, reviews, agent-assignments, notifications,
        │      verification, admin, properties
        └── actions/                      # Server actions for mutations
            ├── listings.ts, comments.ts, saves.ts, inspections.ts,
            └── offers.ts, verification.ts, admin.ts
```

## Getting started

```bash
cd vista-frontend
cp .env.example .env.local       # adjust HAVEN_API_URL if your backend is elsewhere
npm install
npm run dev
```

Open <http://localhost:3000> and start clicking. The app fetches live data from
**haven** (`HAVEN_API_URL`, defaults to `http://localhost:8080`). Pages whose
backend endpoints aren't implemented yet still render mocked data from
`lib/mock-data.ts` — see `vista-frontend/lib/api/README.md` for the full
integration map and outstanding backend gaps (messages, leads roll-up, agent
directory, audit log).

### Auth wiring

- Login posts to `/api/auth/login` (Next.js route handler) which calls
  haven and stores the JWT in an httpOnly cookie (`HAVEN_AUTH_COOKIE`,
  default `dh_session`).
- Server Components / Server Actions read that cookie via
  `lib/api/session.ts:getToken()`.
- Browser code never touches the JWT — it always calls Next.js routes
  in `app/api/*`.

### Useful routes

| Route                 | What you'll see                                        |
|-----------------------|--------------------------------------------------------|
| `/`                   | Marketing landing                                      |
| `/listings`           | Browse + filters                                       |
| `/listings/lst_1`     | Listing detail (full mock with comments, fees, slots)  |
| `/agents`             | Verified-agent directory                               |
| `/dream`              | Dream AI chat preview                                  |
| `/dashboard`          | Applicant workspace                                    |
| `/owner`              | Owner workspace                                        |
| `/owner/listings/lst_1` | Per-listing pipeline                                 |
| `/agent`              | Agent workspace                                        |
| `/admin`              | Admin ops                                              |

## Design system

Colours, spacing and typography are defined as CSS variables in `app/globals.css`
and re-exported through Tailwind's `@theme inline`. To re-skin the platform, edit the
`:root { … }` tokens — every component will follow.

## Status

Capstone scaffolding · ready for backend wiring. Built at **Moniepoint DreamDev Bootcamp 2026**.
