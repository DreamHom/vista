# Dream AI UI (Vista) — contract alignment

**Authoritative backend behaviour** is documented in the Haven repo:

[`../haven/docs/dream-ai-capabilities.md`](../haven/docs/dream-ai-capabilities.md)

The **wire contract** is `GET /v3/api-docs` (springdoc) on Haven plus the Dream AI tag description. When Haven changes routes or DTOs, bump Vista’s frozen OpenAPI bundle and regenerate types.

---

## What the UI may assume (Haven MVP)

- **Turn model**: `AssistantTurnV1` with kinds such as **clarify** (short prompt + chips + markdown), **compare** (two listing ids; LIVE visibility enforced), **rank / reply** (Haiku over a **bounded LIVE catalogue slice**, or stub browse when the model path is off). Server **re-validates** listing ids.
- **Empty / no-match signals** (often in `turn.meta`): **`inventoryEmpty`**, **`queryTooStrict`**, distinct from generic no-match copy.
- **Persistence**: threaded chats; history rehydration filters listing blocks to **LIVE** ids; **`meta.staleIdsFiltered`** when ids were dropped.
- **Errors & limits**:
  - **Rate limit**: **429** `application/problem+json`, `Retry-After`, type under `…/dream-ai-rate-limited`.
  - **Moderation** (MVP substring list): **422** Problem+JSON on JSON `POST`; on **SSE**, same semantics via terminal **`problem`** event (`status: 422`).
- **SSE** (`POST /api/dream-ai/turns/stream`): events **`trace`** → optional **`delta`** (markdown chunks of the **final** reply for UX) → **`final`**. After the stream starts, HTTP may stay **200** on failure; clients must handle the **`problem`** event (RFC 7807 JSON), not HTTP status alone.
- **Idempotency**: repeat **`clientMessageId`** with the same **`chatId`** → same **`traceId`** / turn envelope, no duplicate USER/ASSISTANT rows.

---

## What the UI must not imply (out of scope for MVP parity)

Do not promise or design UX as if these existed unless product re-opens scope:

- **Token-by-token** streaming from the LLM (server `delta` chunks **final markdown** for display only).
- **TOOL** role rows / persisted multi-step tool traces.
- **Cancel** or partial persist + patch mid-turn.
- **Full-database semantic / vector search** (ranking is over a **bounded slice** only).
- **External moderation API** (substring hook only today).

---

## Current Vista implementation (Haven v1.0.3)

When **signed in**, `DreamAiChat` uses:

- **`POST /api/dream-ai/turns/stream`** (SSE: `trace`, `delta`, `final`, terminal `problem`) with **`POST /dream-ai/suggestions` JSON fallback** on transport errors.
- **`clientMessageId`** (UUID) and **`chatId`** continuation on follow-up turns.
- **Chip follow-ups** via `userChoice` (`chipId`, `sendText`).
- **Past threads**: `GET /dream-ai/chats` + **`GET /dream-ai/chats/{id}`** (dropdown + hydrate).
- **Problem / rate limit**: strip UI + `retryAfterSeconds` when present; upstream-style failures also set the amber degraded banner.

When **logged out**, replies stay **local** (`match.ts` + word reveal) — no Haven thread.

