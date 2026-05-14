# Haven backend gaps, desired capabilities, and Vista integration

This document collates **Vista-facing limitations** tied to the **Haven** API and to **features that are stubbed, local-only, or blocked** until backend support exists. For each theme it states **what is missing**, **what we want from Haven**, **what we use it for in the product**, and **where Vista should integrate** once APIs land.

**Canonical API contract:** `docs/haven-api-docs-1.0.1.yaml` (DreamHomes Haven API). “v1.0.1” in UI copy aligns with this bundle.

**Vista integration surface:** `lib/api.ts` (fetch + JWT + `FormData` for uploads), `app/api/[...path]/route.ts` (browser → Haven proxy), `lib/seed/public-data.ts` (public browse + `backendUnavailable`), `lib/*-dashboard.ts` (role workspaces).

---

## 0. How this inventory was built (so you can re-audit)

Searches and patterns used:

| Pattern / component | Why it matters |
| --- | --- |
| `PublicApiNotice` | User-visible callout on public routes when data or API behavior is incomplete or degraded. |
| `PrototypeNotice` (owner / agent / admin primitives) | Yellow-style product banners: local staging, missing endpoints, or design-only flows. |
| `SectionCard` descriptions with “Haven”, “local”, “prototype”, “backend” | Softer banners embedded in page chrome. |
| `EmptyHint` + `backendUnavailable` | Public empty states when Haven browse fails. |
| `toast.*(backend\|Haven\|support)` | Inline stubs for actions blocked on API. |
| `ErrorPanel` bodies mentioning **Haven** or generic load failures | Surfaces that depend on Haven for primary data. |
| `localStorage` in `lib/*-dashboard.ts`, `lib/auth-store.ts` | Features persisted only in the browser until APIs exist. |
| `ForgotPasswordForm` / `ResetPasswordForm` | Forms that **do not call Haven** (client-only success paths). |
| Comments in `dream-ai-chat.tsx`, `dream-ai/match.ts`, `lib/api.ts` | Planned swap to real endpoints / transports. |

Re-run: `rg -i "haven|prototype|publicapinotice|backendunavailable|stored locally|not exposed|waiting on backend" --glob "*.{tsx,ts}"`.

---

## 1. Executive summary

Vista already integrates Haven for **login**, **registration (202 + next-step copy)**, **many CRUD reads/writes** (listings, saves, offers, inspections claim, notifications, verifications with `POST /verifications/files`, owner listing photos via `POST /listings/{id}/photos`, admin moderation actions, etc.). Large parts of the experience still **depend on localStorage**, **non-persistent UI state**, or **copy that explains missing DTO fields** because **endpoints, RBAC, or payloads** are incomplete. Several **auth-adjacent** flows are **not wired to Haven at all** (password reset). **Dream AI** is entirely **client-side heuristics + fake streaming** until a dedicated API exists.

---

## 2. Banner & notice inventory (user-visible)

### 2.1 `PublicApiNotice` (public discovery & trust)

| Location | Message / intent |
| --- | --- |
| `app/(public)/listings/[id]/page.tsx` | Backend-driven listing; **pet rules & utilities** not in v1.0.1; **map pin approximate** until real coordinates. |
| `app/(public)/map/page.tsx` | Haven listing browse **unavailable** at configured API base **or** pins are **approximate** until geometry ships. |
| `components/public/listings-explorer.tsx` | Haven public endpoints **unavailable** — empty backend state (not local mock listings). |
| `app/(public)/compare/page.tsx` | Haven **compare suggestions empty** at API base. |
| `components/dream-ai/dream-ai-page-shell.tsx` | Haven listing browse **unavailable** — Dream AI has **no live inventory** to rank. |
| `app/(public)/owners/[id]/page.tsx` | Haven does **not** expose richer **public owner bio**; page built from trust data + browse. |

### 2.2 `PrototypeNotice` (workspaces / admin)

| Location | Title / theme |
| --- | --- |
| `components/admin/pages/admin-settings-page.tsx` | Platform settings **staged locally** — no Haven **configuration** endpoint (commissions, SLAs, verification requirements). |
| `components/admin/pages/admin-listings-page.tsx` | Admin listing index **stitched** — no dedicated **admin listing catalog**; merges inventory + audit rows. |
| `components/admin/pages/admin-comments-page.tsx` | **Flagged comment queues** not exposed by Haven. |
| `components/admin/pages/admin-ads-page.tsx` | Ads operations **modelled locally** — no **billing / approval / delivery** endpoints. |
| `components/agent/pages/agent-listing-management-page.tsx` | Agent-side listing edits **prototype** — **PATCH** limited to **owner**; second notice: **slot creation** owner-only API today. |
| `components/agent/pages/agent-inspections-page.tsx` | Agent inspection actions **staged locally** — assignment acceptance exists; **inspection decision** endpoints missing. |
| `components/agent/pages/agent-offers-page.tsx` | Agent countering **staged** — offer mutations **owner/applicant scoped**; roadmap for agent negotiation. |
| `components/agent/pages/agent-leads-page.tsx` | Contact detail **intentionally narrow** — applicant PII behind workflow. |
| `components/agent/pages/agent-ads-page.tsx` | Same ads **v1.0.1** gap as admin (purchase/approval). |
| `components/owner/pages/owner-inspections-page.tsx` | Owner inspection **response actions prototype** — approve/decline/no-show not in v1.0.1; **local** status/notes. |
| `components/owner/pages/owner-leads-page.tsx` | **Lead contacts** not exposed by v1.0.1. |
| `components/owner/pages/owner-new-property-page.tsx` | **Documents real; draft memory local** — submit uploads to Haven + verification; draft in **browser storage**. |
| `components/owner/pages/owner-dashboard-home-page.tsx` | **Complete owner verification** to unlock trust (product nudge; verification APIs exist but UX ties to Haven state). |

### 2.3 Other prominent “Haven / backend” copy (SectionCards, hints, badges)

| Location | Gap signalled |
| --- | --- |
| `app/(public)/listings/[id]/page.tsx` | Badge: “No inspection fee in **Haven flow**”. |
| `components/dashboard/profile-page.tsx` | Applicant **photo** not in Haven — **local device** storage; SectionCard mentions **prototype-only extras**. |
| `components/owner/pages/owner-profile-page.tsx` | **Bio + photo** local until endpoints; FieldHint: **owner avatar upload** not exposed. |
| `components/agent/pages/agent-profile-page.tsx` | **Marketing fields staged locally**; FieldHint: draft-only until **public marketing attributes** for agents. |
| `components/owner/pages/owner-property-detail-page.tsx` | **Property basics read-only** until **property update** endpoint (non-price fields). |
| `components/owner/pages/owner-new-property-page.tsx` | **Negotiable flag** not persisted; **virtual tour** field missing; various **FieldHint** “local draft”. |
| `components/dashboard/settings-page.tsx` | Notification prefs **local** until preference endpoints; delete account **blocked** until delete route. |
| `components/owner/pages/owner-settings-page.tsx` | Notification prefs **local**; delete account **prototype**; email mirroring “once Haven wires channels”. |
| `components/agent/pages/agent-settings-page.tsx` | Notification prefs **local**; account deletion **not exposed**. |
| `components/dashboard/inspections-page.tsx` | Fallback copy: location **loading from Haven** (enrichment). |
| `components/dashboard/offers-page.tsx`, `dashboard-home.tsx` | Same “loading from Haven” pattern for listing snippets. |

---

## 3. Authentication, session, and password recovery

| Gap | What we want | Product use | Vista today |
| --- | --- | --- | --- |
| **JWT in `localStorage`** | httpOnly cookie session (or BFF token exchange) + CSRF strategy for browser | Reduce XSS token theft risk | `lib/auth-store.ts` documents this as **capstone-only**; `setAuthTokenProvider` in `app-providers`. |
| **Forgot password** | `POST` initiate reset + email delivery + rate limits | Users recover access without support | `ForgotPasswordForm` (`components/public/auth-forms.tsx`) **only sets local state** — **no Haven call**; always shows success path. |
| **Reset password** | Token-validated `POST` to set new password | Complete reset links | `ResetPasswordForm` same file — **no API**; validates client-side and shows success. |
| **Login when already signed in** | Optional `GET /me` redirect on `/login` | Avoid redundant sign-in screens | Not implemented in `LoginForm` (by design today). |
| **Registration** | Already calls `POST /auth/register` per OpenAPI (202 semantics) | Signup → “Continue to sign in” | `SignupForm` wired; success copy from `RegisterAcceptedResponse`. |

**Integration ask:** Ship **password reset** + **session hardening** contracts in OpenAPI; Vista replaces both forms with real `api.post` flows and error handling; update auth store when moving to cookies.

---

## 4. File uploads & media (what exists vs what is missing)

### 4.1 Already wired to Haven (multipart / real routes)

| Flow | Endpoint pattern (see OpenAPI) | Vista |
| --- | --- | --- |
| Verification documents | `POST /verifications/files` + `POST /verifications` | `lib/owner-dashboard.ts` `uploadVerificationFiles`, `lib/applicant-dashboard.ts` `submitApplicantVerification`; `lib/api.ts` notes `FormData` pass-through. |
| Owner listing gallery | `POST /listings/{listingId}/photos` | `lib/owner-dashboard.ts` `uploadOwnerListingPhoto`; wizard in `owner-new-property-page.tsx`. |

### 4.2 Missing or local-only (user-facing gaps)

| Gap | What we want | Product use | Vista |
| --- | --- | --- | --- |
| **Applicant profile photo** | Avatar URL or binary upload on profile DTO | Applicant identity across dashboard | `profile-page.tsx` — **local image** + copy: Haven doesn’t expose applicant photo fields. |
| **Owner avatar upload** | Same for owners | Owner profile / public trust | `owner-profile-page.tsx` FieldHint. |
| **Agent public marketing media** | Optional headshot / cover rules | Agent cards, profile | Agent profile page relies on **local draft** for rich fields. |
| **Listing media beyond current model** | Virtual tour URL, floor plans, video (as product defines) | Listing detail, search | New property page hints; **virtual tour** not persisted. |

---

## 5. Client-side persistence (until Haven APIs replace it)

| Data | Storage | Files |
| --- | --- | --- |
| **Admin platform settings** (verification toggles, SLAs, etc.) | `localStorage` | `lib/admin-dashboard.ts` `readAdminPlatformSettings` / `saveAdminPlatformSettings`; `admin-settings-page.tsx`. |
| **Admin ads state** | `localStorage` | `lib/admin-dashboard.ts` `readAdminAdsState`; admin + agent ads pages. |
| **Admin comment flags** (stitched moderation) | `localStorage` | `lib/admin-dashboard.ts` `readAdminCommentFlags`; `admin-comments-page.tsx`. |
| **Applicant notification preferences** | `localStorage` | `lib/applicant-dashboard.ts`; `dashboard/settings-page.tsx`. |
| **Applicant profile “draft” extras** (incl. photo metadata) | `localStorage` | `lib/applicant-dashboard.ts`; `profile-page.tsx`. |
| **Owner notification preferences** | `localStorage` | `lib/owner-dashboard.ts`; `owner-settings-page.tsx`. |
| **Owner property wizard draft** | `localStorage` | `lib/owner-dashboard.ts`; `owner-new-property-page.tsx`. |
| **Owner profile draft** (bio, etc.) | `localStorage` | `lib/owner-dashboard.ts`; `owner-profile-page.tsx`. |
| **Agent profile draft** (marketing fields) | `localStorage` | `lib/agent-dashboard.ts`; `agent-profile-page.tsx`. |
| **Agent notification preferences** | `localStorage` | `lib/agent-dashboard.ts`; `agent-settings-page.tsx`. |

**Integration ask:** For each bucket, provide **`GET/PATCH /me/settings`**, **`GET/PATCH /admin/platform`**, **`GET/PATCH /admin/ads`**, or domain-specific resources; Vista deletes `readFromStorage`/`write` helpers once migrated.

---

## 6. Dream AI (full stack gap)

| Layer | Gap | What we want | Vista |
| --- | --- | --- | --- |
| **Inventory** | Depends on public listings API | Stable filtered `GET /listings` | `dream-ai-page-shell.tsx` PublicApiNotice; `lib/dream-ai/match.ts`. |
| **Reasoning** | Heuristic parser, not LLM | Server-side prompt + safety + citations to listing IDs | `match.ts` |
| **Transport** | Fake word-by-word streaming | SSE or chunked HTTP for assistant tokens | `dream-ai-chat.tsx` header comment: swap `runAssistant` for **`/api/dream-ai`** (or Haven-hosted equivalent) + real transport. |
| **Auth / rate limits** | N/A client-side | Authenticated quota, abuse controls | New BFF or Haven routes. |

---

## 7. Connectivity and public inventory (summary table)

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| Public API unreachable / empty | Reliable `GET /listings`, agent directory, compare suggestion sources | Explorer, map, compare, Dream AI | `lib/seed/public-data.ts`, `listings-explorer`, `map`, `compare`, `dream-ai-page-shell` |

---

## 8. Listings, geography, and rich listing fields

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| **Real coordinates** | Lat/lng or geometry | Map, listing map, discovery | Listing detail notice; `listings-leaflet-map.tsx`; `lib/seed/public-data.ts` |
| **Pet rules & utilities** | Structured listing fields | At-a-glance, compare | Listing detail |
| **Marketing description** | Server-maintained copy | SEO, detail, AI | `public-data.ts` fallback sentence |
| **Agent PATCH listings** | Delegated permissions | Agent listing management | `agent-listing-management-page.tsx` |
| **Agent slot creation** | Scoped slot API | Agent availability UX | Same |
| **Admin listing catalog** | Dedicated index | Admin listings | `admin-listings-page.tsx`, `lib/admin-dashboard.ts` |
| **TAKEN_DOWN admin detail** | Full snapshot | Moderation | `lib/admin-dashboard.ts` placeholder address |

---

## 9. Inspections lifecycle

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| **Owner approve / decline / no-show** not exposed | State machine endpoints + matching notification kinds | Owner inbox reflects server truth | `components/owner/pages/owner-inspections-page.tsx` (local status + notes + `PrototypeNotice`) |
| **Agent inspection decisions / reschedule** not exposed | Agent queue APIs aligned with owner/applicant | Agent inspections stops being design-only | `components/agent/pages/agent-inspections-page.tsx` |
| **Slot creation RBAC** | Agent-scoped or delegated slot create (see §8) | Availability matches policy | `agent-listing-management-page.tsx` (second `PrototypeNotice`) |
| Applicant **claim slot** | Already `POST /inspections` in OpenAPI | Applicant booking | Applicant flows + `lib/applicant-dashboard.ts` |

---

## 10. Offers and negotiations

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| **Agent-side offer mutations** (counter on owner behalf, etc.) | Agent counsel / recommendation endpoints or shared negotiation resource | Agent offers page becomes transactional | `components/agent/pages/agent-offers-page.tsx` (`PrototypeNotice`) |

---

## 11. Leads, contact reveal, and secure handoff

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| **Owner lead contact reveal** | Gated reveal + audit trail | Owner leads “unlock” | `owner-leads-page.tsx` (`PrototypeNotice` + **toast** on click) |
| **Agent pipeline without raw PII** | Workflow-based contact or masked bridge | Agent leads trust | `agent-leads-page.tsx` (`PrototypeNotice` “intentionally narrow”) |
| **Agent `contactDetails` placeholder** | Real handoff payload from Haven | Agent dashboard samples | `lib/agent-dashboard.ts` (`contactDetails` string) |

---

## 12. User profiles, settings, and account lifecycle

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| Applicant / owner / agent **notification preferences** | `GET/PATCH` settings resources | Settings pages | `dashboard/settings-page.tsx`, `owner-settings-page.tsx`, `agent-settings-page.tsx` |
| **Account deletion** all roles | `DELETE` (or deactivate) with confirmation | Danger zone in settings | Applicant `settings-page.tsx`; owner `owner-settings-page.tsx`; agent `agent-settings-page.tsx` (toasts / copy) |
| **Applicant photo**, **owner bio/avatar**, **agent marketing fields** | See §4.2 | Profile surfaces | `profile-page.tsx`, `owner-profile-page.tsx`, `agent-profile-page.tsx` |
| **Public owner bio** | Richer public owner DTO | Public owner page | `app/(public)/owners/[id]/page.tsx` (`PublicApiNotice`) |

---

## 13. Admin, ads, comments, verification workflow

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| **Flagged comment moderation queue** | List + resolve APIs | Admin comments | `admin-comments-page.tsx` |
| **Verification request-more-info** | Structured admin → submitter loop | Admin verification | `admin-verification-page.tsx` (toast stub) |
| **Ads lifecycle** | Billing, approval, delivery, reporting | Admin + agent ads | `admin-ads-page.tsx`, `agent-ads-page.tsx` |
| **Platform configuration** | Server-backed commissions / SLAs / verification toggles | Admin settings | `admin-settings-page.tsx` |
| **Admin listing catalog** | Dedicated index endpoint | Admin listings | `admin-listings-page.tsx`, `lib/admin-dashboard.ts` |

---

## 14. Comments and public Q&A

| Gap | What we want | Product use | Integrate with |
| --- | --- | --- | --- |
| Moderation pipeline for **public comments** | Backend-flagged queue tied to `listingId` | Listing Q&A + admin moderation | Listing detail comments; `admin-comments-page.tsx` |

---

## 15. Toasts and disabled actions (stubbed UX)

| Location | User-visible behaviour | Backend need |
| --- | --- | --- |
| `components/dashboard/settings-page.tsx` | Delete account button → **toast: waiting on backend** | `DELETE /me` or role-specific delete |
| `components/agent/pages/agent-settings-page.tsx` | Same | Same |
| `components/owner/pages/owner-settings-page.tsx` | Delete flow → **toast: signed out locally**; server delete missing | Owner delete endpoint |
| `components/owner/pages/owner-leads-page.tsx` | Contact reveal click → **toast: needs Haven support** | Gated reveal API |
| `components/admin/pages/admin-verification-page.tsx` | “Request more info” → **toast: staged** | Workflow endpoint |

---

## 16. Error panels explicitly tied to Haven loads

These screens treat Haven as the source of truth; failures are user-visible **ErrorPanel** states (retry refetch):

- `owner-properties-page.tsx` — “couldn't load your properties **from Haven**”.
- `owner-offers-page.tsx` — “couldn't load owner offer chains **from Haven**”.
- `owner-comments-page.tsx` — “couldn't load owner comments **from Haven**”.
- `owner-verification-page.tsx` — “couldn't load verification state **from Haven**”.
- Other owner/agent/admin pages: generic “couldn’t load … right now” (still depend on Haven for happy path).

**Integration ask:** Consistent **problem+json** for list endpoints + pagination; Vista already maps `ApiError` in `lib/api.ts`.

---

## 17. Miscellaneous product copy

| Item | Notes |
| --- | --- |
| Inspection fee badge | “No inspection fee in Haven flow” on listing detail — align with billing policy. |
| Applicant notifications | “Everything Haven has sent your way” — ensure notification kinds + deep links stay stable as events grow. |

---

## 18. Implementation checklist for Haven (suggested order)

1. **Operational reliability:** Public `GET /listings` + agents + compare inputs; reduce `backendUnavailable` surfaces.
2. **Auth hardening:** Password reset + refresh/rotation; long-term httpOnly session; Vista removes stub forms.
3. **Geometry & listing richness:** Coordinates, pets/utilities, marketing text, virtual tour, negotiable flag.
4. **Inspections state machine:** Owner + agent transitions; remove local-only inspection state.
5. **Leads & PII gates:** Owner reveal + agent secure handoff; remove toasts.
6. **Profiles & uploads:** Applicant photo, owner avatar, agent marketing DTOs + media rules.
7. **Settings & persistence:** Replace all `localStorage` preference/admin stubs with APIs.
8. **Account deletion:** Applicant + owner + agent.
9. **Ads & admin commerce:** Full vertical.
10. **Dream AI:** `/api/dream-ai` (or Haven) + inventory + streaming + policy.

---

## 19. Source index (grep anchors)

`Haven`, `Haven v1.0.1`, `haven`, `backendUnavailable`, `PublicApiNotice`, `PrototypeNotice`, `stored locally`, `not exposed`, `waiting on backend`, `staged`, `GET /listings`, `approximate`, `ForgotPasswordForm`, `ResetPasswordForm`, `readAdmin`, `DEFAULT_ADMIN`, `uploadOwnerListingPhoto`, `runAssistant`, `dream-ai`.

---

## 20. Future-facing code comments (non-UI)

| Location | Intent |
| --- | --- |
| `lib/seed/listings.ts` | Shape doc / fallback when real `/api/listings` is canonical. |
| `lib/seed/collections.ts` | Possible future `/collections` read API. |
| `lib/types.ts`, `lib/api.ts` | DTO lockstep; `FormData` for uploads. |

---

*Last expanded with a repo-wide audit of notices, auth forms, uploads, localStorage staging, Dream AI, toasts, and ErrorPanel copy. Update when gaps close or new banners appear.*
