# Vista UI anti-slop (Impeccable)

Quick guardrails so inspection and workspace surfaces stay on-brand. See also `DESIGN.md` and `PRODUCT.md`.

## Inspection flows

| Avoid (slop) | Prefer |
|--------------|--------|
| Approve and Decline as equal outline buttons side by side | One primary action; decline/no-show under **⋯** with consequence copy |
| Raw Haven enums on cards (`APPROVED`, `PENDING`) | `inspectionHavenStatusLabel()` / workspace **Approved** labels |
| Owner "Confirmed" vs applicant `APPROVED` | Shared vocabulary: **Pending**, **Approved**, **Declined**, **Cancelled** |
| `rounded-full` tab pills on dashboard inspection pages | `InspectionTabFilters` (square borders) |
| Modal as first step for decline | ⋯ menu + destructive row (dialog only for applicant cancel confirm) |
| Nested cards inside cards | One bordered surface per request row |
| Colored `border-left` accent on queue rows | Full border or `bg-secondary/30` tint |

## Status vocabulary

- **Haven:** `PENDING`, `APPROVED`, `DECLINED`, `CANCELLED`, `NO_SHOW`, `COMPLETED`
- **UI labels:** same words in title case via `lib/inspection-lifecycle.ts`
- **Legacy:** migrate stored `Confirmed` → `Approved` on read

## Offer turn-taking (Haven `proposedByUserId`)

| Avoid | Prefer |
|-------|--------|
| Accept + Reject side by side when reject is easy to mis-tap | Accept primary; **Reject** under **⋯** |
| Acting on rows you proposed (403 from Haven) | Hide actions via `ownerCanRespondToOffer` / `applicantCanRespondToCounter`; show **waiting** banner |
| Raw `APPROVED`-style enums on cards | Human labels + **Your turn** / waiting copy |
| Amber pill “counter received” cards | `border-border bg-secondary/40` + icon, square corners |

Rule: **you cannot accept, decline, or counter an offer you proposed.** The UI mirrors that; the server enforces it with 403.

## Notifications

After Haven-backed owner inspection or offer actions, invalidate role notifications queries (e.g. `owner-notifications`) so the bell and queue stay aligned without a full page reload.

## Engagement (saves, Q&A, reviews)

| Avoid | Prefer |
|-------|--------|
| `rounded-full` / `rounded-3xl` on saved-listings dashboard | `SquareSelectField`, square `SectionCard` |
| “Reply” / nested thread UI when API is flat | “Post question” / “Post answer”; copy says Q&A is chronological |
| `#reviews` links with no anchor | `id="reviews"` on listing reviews section |
| Review form without gate copy | `evaluateReviewEligibility()` banner (CLOSED + ACCEPTED offer) |
| Assuming threaded `parentCommentId` | Flat list; owner answer = new `POST /comments` on listing |
| Hide soft-delete semantics | Author remove via ⋯; toast notes aggregates self-heal on next load |

## Agent assignments (`AgentListingStatus`)

| Avoid | Prefer |
|-------|--------|
| Raw enums (`REQUESTED`, `ACCEPTED`) on cards | `assignmentStatusLabel()` → Invite sent, Active, Declined, Revoked |
| Accept + Decline side by side | Accept primary; **Decline** under **⋯** with required reason dialog |
| Revoke without reason | `OwnerAssignmentCard` revoke dialog (audit trail) |
| Invite while pending/active exists | `ownerCanInviteAgent()` disables search + Invite; banner explains withdraw/revoke first |
| Parallel invite race (409) | `assignmentInviteErrorMessage()` — friendly copy for pending vs active conflicts |
| Revoke on pending invites | **Withdraw invite** on `REQUESTED`; **Revoke assignment** on `ACCEPTED` (same endpoint, reason required) |
| “Reply” / threaded assignment UI | One row per invite; terminal rows in **Past assignments** |

## Agent operational access (`ACCEPTED` only)

| Avoid | Prefer |
|-------|--------|
| Offers / leads / inspections for `REQUESTED` or terminal rows | `acceptedManagedListings()` in `lib/agent-dashboard.ts` |
| Full listing workspace before accept | `AgentOperationalGate` — invite flow or empty state, not edit/offer UI |
| “Assigned listing” implying live access | Public bar copy: accept invite first; revocation is immediate |
| Side-by-side Accept + Decline on invites | Accept primary; decline under **⋯** with required reason |
