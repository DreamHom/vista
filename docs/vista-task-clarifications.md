# Vista task queue clarifications (v1.0.4)

Canonical queue: `haven/docs/vista/vista-task-queue.md`. Status updates are applied there after each pass.

## Completed in Vista

| Task | Notes |
|------|--------|
| VTASK-001 | `ListingTrustChips` on discovery cards, compact tiles, listing detail; `ownerIdentityVerifiedAt` on `PublicListing`. |
| VTASK-002 | `RejectionReasonBanner` on owner verification and applicant profile; `decisionReason` on verification types. |
| VTASK-003 | `CancelInspectionDialog` + `cancelInspectionWithReason`; applicant cancel for PENDING and APPROVED. |
| VTASK-004 | Owner/agent inspections use `listWorkspaceInspections` + `WorkspaceInspectionCard` (Haven status, slot window, time-gated ⋯ menu). Server state cached in `localStorage` after mutations. Legacy notification-card flow removed from inspection pages. |
| VTASK-005 | `notificationDisplayCopy` for INSPECTION_APPROVED, DECLINED, CANCELLED; kinds added to `NotificationKind`. |
| VTASK-006 | Threaded Q&A: `parentCommentId` mapping, owner/agent reply composer, indented replies. |
| VTASK-007 | `GET /listings/{id}/reviews/me/eligibility` drives review CTAs when listing is CLOSED. |
| VTASK-008 | Flag dialog with optional reason + session dedupe; copy aligned to spec. |
| VTASK-009 | Same eligibility endpoint; agent reviewee when `canReviewAgent`. |
| VTASK-010 | `uploadListingPhotoDirect` with multipart fallback in `uploadOwnerListingPhoto`. |
| VTASK-011 | `AutomatedCheckBlock` on admin queue + owner pending card. |
| VTASK-012 | `LivenessCheckStep` (mocked, MOCKED v1 chip) on owner verification and applicant profile; `livenessCheckId` passed on submit; 403/409 resets liveness step. |
| VTASK-013 | Browse compare checkboxes + `/dream-ai?compare=ids` auto-run. |
| VTASK-014 | Soft fallback header when `queryTooStrict` + `kind=reply` with listings rail. |
| VTASK-015 | Chips already dynamic from API; flex-wrap layout (no fixed 3-col). |
| VTASK-016 | `DreamAiModeChip` (“Quick search”) when `provider` is `stub` or `embeddings-only`. |

## Known limitations (not blocking queue)

- Inspection rows without `inspectionRequestId` in notification payload rely on `localStorage` cache until the user performs an action that refreshes server state.
- Applicant names on inspection cards may show as `Applicant #id` until a profile lookup is added.
- Liveness UI is mocked; real camera/SDK is v2.

## Verification against Haven

Run manual checks on `https://haven.dreamhomes.today` per each task test plan. Local Haven optional when `.env` is configured.
