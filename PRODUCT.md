# Product

## Register

product

## Users

DreamHomes serves four roles on one platform:

- **Owners** list properties, manage leads, offers, and verifications.
- **Agents** run listings, assignments, and client-facing workflows.
- **Applicants** browse, save, compare, and apply toward a home.
- **Admins** moderate users, listings, verifications, and audit platform actions.

Most sessions are task-focused: find a listing, complete a verification step, or clear a moderation queue. Users are often on mobile or mid-workflow; clarity and density beat decoration.

## Product Purpose

Vista is the DreamHomes portal: public discovery (listings, agents, content) plus authenticated workspaces per role. Success means users complete real-estate jobs without friction, and admins can trust what happened via audit trails and clear status.

Haven is the API backend; Vista is where design language lives and where UI work should stay on-brand.

## Brand Personality

**Editorial. Direct. Boxy.**

Real-estate with confidence, not startup gloss. Black-and-white structure with rare brand blue for links and primary CTAs. Feels like a serious property desk or magazine layout, not a generic SaaS dashboard.

## Anti-references

- Rounded “friendly” SaaS cards, bubbly pills, and soft shadows as default chrome.
- Gradient heroes, glassmorphism, and decorative gradient text.
- Purple-on-white “AI product” palettes and hero-metric template dashboards.
- Nested card stacks and identical icon-heading-text grids repeated without purpose.
- Side-stripe accent borders on list rows (colored `border-left` callouts).
- Em dashes in UI copy.

## Design Principles

1. **Structure before ornament** — Hairline borders and flat surfaces define regions; color is earned, not sprayed.
2. **Square by default** — Zero radius on tokens; rectangular cards, inputs, and controls unless a surface truly needs an exception.
3. **Accent is scarce** — Brand blue (`accent`) is for links, logo, and high-intent CTAs; primary actions use near-black/white inversion.
4. **Role shells are consistent** — Admin, owner, agent, and applicant workspaces share the same sidebar + sticky header pattern.
5. **Show state clearly** — Verification, suspension, and moderation surfaces prioritize readable status and auditability over flair.

## Accessibility & Inclusion

- Target **WCAG 2.1 AA** for text contrast on light and dark surfaces.
- Respect **`prefers-reduced-motion`**: pair ambient animations with `motion-safe:`; no layout animation.
- Focus rings use `ring` token (brand blue); keyboard paths must remain visible on bordered controls.
- Light mode is the public front door; dark mode supports listing detail and dashboards — both must feel intentional, not inverted by accident.

## Agent workflow (Impeccable)

UI work in this repo should load **`PRODUCT.md`** + **`DESIGN.md`** via the Impeccable skill before designing. The **agent** chooses sub-commands (`craft`, `shape`, `polish`, `audit`, etc.) from `~/.claude/skills/impeccable/` based on the task; the user does not need to name them. Refresh context with `/impeccable teach` or `/impeccable document` when strategy or tokens change materially.
