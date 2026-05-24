---
name: DreamHomes Vista
description: Editorial real-estate UI — minimal, boxy, black/white with rare brand blue.
colors:
  background: "#ffffff"
  foreground: "#121212"
  card: "#ffffff"
  secondary: "#f7f7f7"
  muted: "#f5f5f5"
  muted-foreground: "#737373"
  primary: "#121212"
  primary-foreground: "#ffffff"
  accent: "#2b7cc9"
  accent-foreground: "#ffffff"
  border: "#e6e6e6"
  destructive: "#df2020"
  success: "#2d8a4e"
  warning: "#f2991a"
  dark-background: "#121212"
  dark-foreground: "#f5f5f5"
  dark-card: "#1a1a1a"
  dark-border: "#2e2e2e"
typography:
  display:
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "-0.04em"
    textTransform: "uppercase"
rounded:
  none: "0"
  sm: "0"
  md: "0"
  lg: "0"
spacing:
  shell-gutter: "1.5rem"
  card-padding: "1rem"
  card-padding-md: "1.5rem"
  nav-item-y: "0.625rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "0 1rem"
    height: "2.5rem"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.none}"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-padding}"
  nav-item-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
---

## Overview

**Creative north star: The Editorial Grid.**

Vista reads like a property magazine laid out on a drafting table: sharp rectangles, 1px hairlines, generous whitespace, and typography that carries hierarchy without loud color. Motion is ambient and optional (floating illustrations), never structural.

**Mood:** calm, competent, Nigerian real-estate scale without fintech neon or template SaaS chrome.

**Layout rhythm:** `border border-border` boxes on `bg-card` or `bg-white`; sidebars `256px` with `border-r`; sticky top headers with `border-b`. Prefer explicit borders over drop shadows (`shadow-none` on cards).

**Dark mode:** class-based (`dark` on `<html>`). Light = marketing + listings index; dark = listing detail + authenticated shells.

## Colors

Tokens live in `app/globals.css` as HSL components (`hsl(var(--token))`). Canonical roles:

| Role | Light | Usage |
|------|-------|--------|
| `background` / `foreground` | White / near-black | Page canvas and body text |
| `primary` | Near-black fill | Filled buttons, selected segmented controls |
| `accent` | Brand blue `#2B7CC9` | Links, logo glyph, schedule/tour CTAs — **use sparingly** |
| `secondary` / `muted` | Soft gray fills | Hover rows, quiet panels |
| `border` / `input` | 90% gray hairlines | Cards, inputs, dividers |
| `destructive` / `success` / `warning` | Status only | Errors, confirmations, alerts |

**Strategy:** Restrained — tinted neutrals (warm near-black, not pure `#000`) plus one accent well under 30% of any screen.

Do not introduce extra accent hues without updating `--accent` in `globals.css` and this file.

## Typography

- **Family:** SF Pro subset via `next/font/local` → `--font-sans`; Tailwind `font-sans`.
- **Scale:** Hierarchy through size + weight (≥1.25 step between levels), not color alone.
- **Eyebrow labels:** `text-[11px] uppercase tracking-eyebrow text-muted-foreground` for nav section titles.
- **Body:** Default `text-sm` in dense workspaces; cap prose blocks at ~65–75ch where long copy appears.
- **Features:** `rlig` + `calt` enabled on `body`.

## Elevation

**Flat / tonal.** Depth comes from `bg-secondary`, `bg-muted`, and `border-border`, not elevation shadows. Cards use `shadow-none`. Avoid card-in-card nesting; one bordered surface per grouping.

Global utility overrides zero out legacy `rounded-2xl` / `rounded-3xl` / `rounded-full` so older components stay square.

## Components

### Buttons (`components/ui/button.tsx`)

- Variants: `primary` (near-black), `accent` (brand blue), `secondary`, `outline`, `ghost`, `destructive`, `link`.
- Sizes: `sm` h-8, `md` h-10, `lg` h-12, `icon` 10×10.
- Focus: `ring-2 ring-ring ring-offset-2`.
- Effective corners: **0** via `--radius: 0`.

### Cards and panels

Pattern used across admin, compare, and dashboards:

```tsx
className="border border-border bg-card px-4 py-4"
// or bg-white in light workspace shells
```

Padding steps: `p-4`, `p-6 md:p-8` for page sections.

### Workspace shell (admin / owner / agent / applicant)

- Grid: `lg:grid-cols-[256px_minmax(0,1fr)]`
- Sidebar: `border-r border-border bg-white`, sticky full viewport height
- Nav item: `border-l` active indicator — `border-foreground bg-secondary` when active, `border-transparent` when idle
- Mobile: horizontal scroll nav with `border-t` under sticky header

### Forms

- Inputs: bordered rectangles, `border-input`, no pill shapes
- Prefer inline expansion over modals when adding fields or filters

### Dream AI / Nexus UI

Chat surfaces may use `nexus-ui` primitives; still align to token colors and square overrides. Dashboard Dream AI promo uses the same flat bordered card pattern as other workspace panels.

## Do's and Don'ts

**Do**

- Use `border border-border` + flat `bg-card` / `bg-white` for grouping.
- Keep brand blue for links, logo, and one primary CTA per view.
- Use `cn()` and existing shadcn-style primitives under `components/ui/`.
- Test both light public pages and `dark` workspace routes.
- Use `motion-safe:` for any `animate-ambient-*` decoration.

**Don't**

- Add `rounded-lg` / `rounded-full` as a default look (token radius is 0). Inspection queues use `InspectionTabFilters` and `docs/ui-anti-slop.md` for flow-specific guardrails.
- Use drop shadows, glass blur, or gradient text for emphasis.
- Stack identical icon+title+body cards in a grid without a strong reason.
- Use colored left borders on list items for “accent.”
- Hardcode hex colors in components — use semantic tokens (`text-accent`, `bg-primary`).
