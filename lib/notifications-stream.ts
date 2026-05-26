"use client";

/**
 * Notifications SSE client — wires `GET /notifications/stream` per Haven
 * OpenAPI v1.0.4 (docs/haven-api-docs-1.0.4.yaml lines 4653-4684).
 *
 * Contract:
 *   - text/event-stream connection, opens long-lived
 *   - `security: bearerAuth` so we MUST attach the JWT
 *   - Each event:
 *       event: <NotificationKind>     e.g. INSPECTION_REQUESTED
 *       data:  { "id": 123, "kind": "INSPECTION_REQUESTED", "payload": {...} }
 *   - Disconnects on auth failure / network drop; clients should reconnect.
 *
 * We can't use native `EventSource` because it doesn't support custom headers,
 * and our JWT lives in localStorage (not a cookie). So we use fetch +
 * ReadableStream and parse the SSE frames ourselves — same approach as
 * dream-ai/stream-turn.
 */

import type { NotificationResponse } from "@/lib/applicant-dashboard";

export interface NotificationStreamEvent {
  /** The NotificationKind string (event field). */
  kind: string;
  /** The full notification payload from the `data` line. */
  notification: NotificationResponse;
}

export interface NotificationStreamHandlers {
  onEvent: (event: NotificationStreamEvent) => void;
  /** Fired on terminal auth failure (401). Caller should stop reconnecting. */
  onUnauthorized?: () => void;
  /** Fired on each open (handy for surfacing "connected" state). */
  onOpen?: () => void;
  /** Fired on each disconnect/error before backoff retry kicks in. */
  onDisconnect?: (reason: string) => void;
}

function parseSseBlock(block: string): { event: string; data: string } {
  let event = "message";
  const dataLines: string[] = [];
  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      const rest = line.slice(5);
      dataLines.push(rest.startsWith(" ") ? rest.slice(1) : rest);
    }
  }
  return { event, data: dataLines.join("\n") };
}

async function* iterateSseBlocks(stream: ReadableStream<Uint8Array>, signal: AbortSignal): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      buf = buf.replace(/\r\n/g, "\n");
      let sep: number;
      while ((sep = buf.indexOf("\n\n")) !== -1) {
        const block = buf.slice(0, sep).trim();
        buf = buf.slice(sep + 2);
        if (block) yield block;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
}

/**
 * Open a single SSE attempt. Resolves with `"401"` when haven returns 401,
 * `"disconnect"` when the stream closes or errors normally. The caller layer
 * (createNotificationStream) decides whether to reconnect.
 */
async function runSseAttempt(
  token: string,
  handlers: NotificationStreamHandlers,
  signal: AbortSignal,
): Promise<"401" | "disconnect"> {
  let response: Response;
  try {
    const url = new URL("/api/notifications/stream", window.location.origin);
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      signal,
      cache: "no-store",
    });
  } catch (err) {
    if (signal.aborted) return "disconnect";
    handlers.onDisconnect?.(`network error: ${(err as Error).message}`);
    return "disconnect";
  }

  if (response.status === 401) {
    handlers.onUnauthorized?.();
    return "401";
  }

  if (!response.ok || !response.body) {
    handlers.onDisconnect?.(`HTTP ${response.status}`);
    return "disconnect";
  }

  handlers.onOpen?.();

  try {
    for await (const block of iterateSseBlocks(response.body, signal)) {
      const { event: kind, data } = parseSseBlock(block);
      if (!data) continue;
      let parsed: NotificationResponse | null = null;
      try {
        parsed = JSON.parse(data) as NotificationResponse;
      } catch {
        continue;
      }
      if (!parsed || typeof parsed.id !== "number") continue;
      handlers.onEvent({ kind, notification: parsed });
    }
  } catch (err) {
    if (!signal.aborted) {
      handlers.onDisconnect?.(`stream error: ${(err as Error).message}`);
    }
  }
  return "disconnect";
}

export interface NotificationStreamController {
  /** Stop the stream and prevent further reconnects. */
  close: () => void;
}

/**
 * Open the notifications SSE stream with exponential-backoff reconnect.
 *
 * Backoff: 1s → 2s → 4s → 8s → cap at 30s. Resets on a successful open.
 * Stops permanently on 401 — the caller's auth flow has to recover.
 */
export function createNotificationStream(
  getToken: () => string | null,
  handlers: NotificationStreamHandlers,
): NotificationStreamController {
  const abortController = new AbortController();
  let stopped = false;
  let attemptDelayMs = 1_000;
  const MAX_DELAY = 30_000;

  async function loop() {
    while (!stopped && !abortController.signal.aborted) {
      const token = getToken();
      if (!token) {
        // Not signed in — wait a beat and re-check (avoids busy-loop while
        // the auth store hydrates).
        await wait(2_000, abortController.signal);
        continue;
      }
      const outcome = await runSseAttempt(token, handlers, abortController.signal);
      if (stopped || abortController.signal.aborted) break;
      if (outcome === "401") {
        // Terminal — caller (the lib/api refresh path or the app-level expired
        // listener) handles re-auth. Don't bang on haven.
        break;
      }
      // Disconnect (network blip / server restart / graceful close).
      // Back off, then retry.
      await wait(attemptDelayMs, abortController.signal);
      attemptDelayMs = Math.min(attemptDelayMs * 2, MAX_DELAY);
    }
  }

  // Reset backoff after a successful open: wrap the onOpen handler.
  const userOnOpen = handlers.onOpen;
  handlers.onOpen = () => {
    attemptDelayMs = 1_000;
    userOnOpen?.();
  };

  void loop();

  return {
    close: () => {
      stopped = true;
      abortController.abort();
    },
  };
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(t);
      resolve();
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
