import { getCurrentToken } from "@/lib/auth-store";
import type { ProblemDetail } from "@/lib/types";
import type { DreamAiRunTurnRequest, DreamAiRunTurnResponse } from "./contracts";

function parseSseEventBlock(block: string): { event: string; data: string } {
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

function inferEventFromJson(json: unknown): "trace" | "delta" | "final" | "problem" | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (typeof o.type === "string" && (typeof o.title === "string" || typeof o.detail === "string")) {
    return "problem";
  }
  if (o.turn != null && typeof o.chatId === "number" && typeof o.traceId === "string") {
    return "final";
  }
  if (typeof o.markdown === "string" && o.turn == null && o.chatId == null) {
    return "delta";
  }
  if (typeof o.traceId === "string" && o.markdown == null && o.turn == null) {
    return "trace";
  }
  return null;
}

async function* iterateSseBlocks(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (true) {
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
    buf = buf.replace(/\r\n/g, "\n");
    const tail = buf.trim();
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}

export interface DreamAiStreamHandlers {
  onTrace?: (traceId: string) => void;
  onDelta?: (fragment: string) => void;
  onFinal: (payload: DreamAiRunTurnResponse) => void;
  onProblem: (problem: ProblemDetail) => void;
}

export class DreamAiStreamAbortedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DreamAiStreamAbortedError";
  }
}

/**
 * `POST /api/dream-ai/turns/stream` — consumes SSE until `final` or terminal `problem`.
 */
export async function streamDreamAiTurn(
  body: DreamAiRunTurnRequest,
  handlers: DreamAiStreamHandlers,
): Promise<void> {
  if (typeof window === "undefined") {
    throw new DreamAiStreamAbortedError("Dream AI stream is browser-only");
  }

  const token = getCurrentToken();
  if (!token) throw new DreamAiStreamAbortedError("Not authenticated");

  const url = new URL("/api/dream-ai/turns/stream", window.location.origin);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    let problem: ProblemDetail | null = null;
    try {
      problem = (await res.json()) as ProblemDetail;
    } catch {
      /* empty */
    }
    const retryHeader = res.headers.get("Retry-After");
    const sec = retryHeader ? parseInt(retryHeader, 10) : NaN;
    const merged: ProblemDetail = {
      ...(problem ?? { title: "Too many requests", status: 429 }),
      status: 429,
    };
    if (!Number.isNaN(sec)) (merged as Record<string, unknown>).retryAfterSeconds = sec;
    handlers.onProblem(merged);
    return;
  }

  if (!res.ok) {
    const text = await res.text();
    let problem: ProblemDetail | null = null;
    try {
      problem = text ? (JSON.parse(text) as ProblemDetail) : null;
    } catch {
      /* empty */
    }
    handlers.onProblem(
      problem ?? { title: res.statusText, status: res.status, detail: text ? text.slice(0, 400) : undefined },
    );
    return;
  }

  if (!res.body) {
    handlers.onProblem({ title: "Empty response", detail: "No response body from Dream AI stream." });
    return;
  }

  let sawFinal = false;
  for await (const block of iterateSseBlocks(res.body)) {
    const { event: rawEvent, data } = parseSseEventBlock(block);
    if (!data) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      continue;
    }
    let event = rawEvent;
    if (event === "message") {
      const inferred = inferEventFromJson(parsed);
      if (inferred) event = inferred;
    }
    switch (event) {
      case "trace": {
        const traceId =
          typeof (parsed as { traceId?: unknown }).traceId === "string"
            ? (parsed as { traceId: string }).traceId
            : undefined;
        if (traceId) handlers.onTrace?.(traceId);
        break;
      }
      case "delta": {
        const frag =
          typeof (parsed as { markdown?: unknown }).markdown === "string"
            ? (parsed as { markdown: string }).markdown
            : "";
        if (frag) handlers.onDelta?.(frag);
        break;
      }
      case "final": {
        const payload = parsed as DreamAiRunTurnResponse;
        if (payload && typeof payload.chatId === "number" && payload.turn) {
          sawFinal = true;
          handlers.onFinal(payload);
        }
        break;
      }
      case "problem": {
        handlers.onProblem(parsed as ProblemDetail);
        return;
      }
      default:
        break;
    }
  }

  if (!sawFinal) {
    handlers.onProblem({
      title: "Incomplete stream",
      detail: "The assistant response ended before a final event.",
    });
  }
}
