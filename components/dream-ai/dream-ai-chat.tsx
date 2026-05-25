"use client";

/**
 * Dream AI chat shell — Haven v1.0.3 contract when signed in (SSE + JSON fallback),
 * local heuristics when logged out. See `haven/docs/dream-ai-capabilities.md` and
 * `docs/dream-ai-ui.md`.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, ChevronDown, History, Plus, Sparkles, WifiOff } from "lucide-react";

import { LogoMark } from "@/components/logo";
import { Thread, ThreadContent, ThreadScrollToBottom } from "@/components/nexus-ui/thread";
import {
  Message,
  MessageStack,
  MessageContent,
  MessageMarkdown,
  MessageAvatar,
} from "@/components/nexus-ui/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
} from "@/components/nexus-ui/prompt-input";
import { Suggestions, SuggestionList, Suggestion } from "@/components/nexus-ui/suggestions";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentToken, useAuthStore } from "@/lib/auth-store";
import type { AssistantTurnV1, ChipOption, DreamAiRunTurnRequest } from "@/lib/dream-ai/contracts";
import { getDreamAiChat, listDreamAiChats, postDreamAiTurn } from "@/lib/dream-ai/haven-api";
import { composeReply, parseQuery, rankMatches, type ScoredMatch } from "@/lib/dream-ai/match";
import { DreamAiStreamAbortedError, streamDreamAiTurn } from "@/lib/dream-ai/stream-turn";
import { ApiError } from "@/lib/api";
import type { ProblemDetail } from "@/lib/types";
import type { PublicListing } from "@/lib/seed/public-data";
import { cn } from "@/lib/utils";

import { AssistantTurnPanel } from "./assistant-turn-panel";
import { DreamAiWelcomeBanner } from "./dream-ai-welcome-banner";
import { InlineListing } from "./inline-listing";

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      source: "guest";
      content: string;
      matches: ScoredMatch[];
      streaming: boolean;
    }
  | {
      id: string;
      role: "assistant";
      source: "haven";
      turn: AssistantTurnV1;
      streamingMarkdown: string;
      streaming: boolean;
    };

const STARTER_PROMPTS = [
  "Find me a 3 bedroom in Lekki under 2 million",
  "What should I look for at a property inspection?",
  "Is ₦850,000 for a self-con in Yaba fair?",
  "Family home in Abuja under ₦300M",
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

async function* streamReply(text: string) {
  const tokens = text.split(/(\s+)/);
  for (const tok of tokens) {
    await new Promise((r) => setTimeout(r, 14 + Math.random() * 28));
    yield tok;
  }
}

function emptyTurn(): AssistantTurnV1 {
  return { kind: "reply", markdown: "", blocks: [], meta: {} };
}

function mapHistoryMessages(
  messages: import("@/lib/dream-ai/contracts").DreamAiChatMessageResponse[],
): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const msg of messages) {
    if (msg.role === "USER" && msg.userText) {
      out.push({ id: `u-${msg.id}`, role: "user", content: msg.userText });
    }
    if (msg.role === "ASSISTANT" && msg.assistantTurn) {
      out.push({
        id: `a-${msg.id}`,
        role: "assistant",
        source: "haven",
        turn: msg.assistantTurn,
        streamingMarkdown: "",
        streaming: false,
      });
    }
  }
  return out;
}

function problemBanner(problem: ProblemDetail): { title: string; detail: string } {
  const title = problem.title ?? "Something went wrong";
  const detail = problem.detail ?? (typeof problem.status === "number" ? `HTTP ${problem.status}` : "Please try again.");
  return { title, detail };
}

export function DreamAiChat({
  embedded = false,
  listings,
  initialPrompt,
  initialCompareIds,
  occupyFullHeight = false,
  onConversationChange,
}: {
  embedded?: boolean;
  listings: PublicListing[];
  /** Auto-send once when set (dashboard prompt chips). */
  initialPrompt?: string;
  /** From browse compare bar (`/dream-ai?compare=1,2,3`). */
  initialCompareIds?: number[];
  occupyFullHeight?: boolean;
  onConversationChange?: (active: boolean) => void;
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const signedIn = hydrated && !!token;

  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [chatId, setChatId] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [providerIssue, setProviderIssue] = React.useState(false);
  const [threadProblem, setThreadProblem] = React.useState<ProblemDetail | null>(null);
  const [chatsLoading, setChatsLoading] = React.useState(false);
  const [chatSummaries, setChatSummaries] = React.useState<{ id: number; preview?: string }[]>([]);

  const assistantSlotRef = React.useRef<string | null>(null);
  const hasConversation = messages.length > 0;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  React.useEffect(() => {
    onConversationChange?.(hasConversation);
  }, [hasConversation, onConversationChange]);

  const loadChatList = React.useCallback(async () => {
    if (!signedIn) return;
    setChatsLoading(true);
    try {
      const page = await listDreamAiChats(0, 20);
      setChatSummaries(page.content.map((c) => ({ id: c.id, preview: c.preview })));
    } catch {
      setChatSummaries([]);
    } finally {
      setChatsLoading(false);
    }
  }, [signedIn]);

  const openChat = React.useCallback(
    async (id: number) => {
      if (!signedIn) return;
      setBusy(true);
      setThreadProblem(null);
      try {
        const detail = await getDreamAiChat(id);
        setChatId(detail.chat.id);
        setMessages(mapHistoryMessages(detail.messages));
      } catch (e) {
        const p =
          e instanceof ApiError && e.problem
            ? e.problem
            : ({ title: "Could not load chat", detail: String(e) } satisfies ProblemDetail);
        setThreadProblem(p);
      } finally {
        setBusy(false);
      }
    },
    [signedIn],
  );

  const applyFinal = React.useCallback((slotId: string, res: import("@/lib/dream-ai/contracts").DreamAiRunTurnResponse) => {
    if (typeof res.chatId === "number") setChatId(res.chatId);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === slotId && m.role === "assistant" && m.source === "haven"
          ? { ...m, turn: res.turn, streaming: false, streamingMarkdown: "" }
          : m,
      ),
    );
    assistantSlotRef.current = null;
  }, []);

  const handleProblem = React.useCallback((slotId: string | null, problem: ProblemDetail) => {
    if (slotId) {
      setMessages((prev) => prev.filter((m) => m.id !== slotId));
    }
    assistantSlotRef.current = null;
    setThreadProblem(problem);
    const st = problem.status;
    const t = String(problem.type ?? "").toLowerCase();
    if (st === 502 || st === 503 || st === 504 || t.includes("upstream")) {
      setProviderIssue(true);
    }
  }, []);

  const runGuestAssistant = React.useCallback(
    async (userText: string) => {
      const parsed = parseQuery(userText);
      const ranked = rankMatches(parsed, listings, 12);
      const matches = ranked.slice(0, 3);
      const full = composeReply(parsed, matches);
      const id = makeId();
      setMessages((prev) => [...prev, { id, role: "assistant", source: "guest", content: "", matches, streaming: true }]);
      await new Promise((r) => setTimeout(r, 200));
      let buffer = "";
      for await (const chunk of streamReply(full)) {
        buffer += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === id && m.role === "assistant" && m.source === "guest" ? { ...m, content: buffer } : m)),
        );
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id && m.role === "assistant" && m.source === "guest" ? { ...m, streaming: false } : m)),
      );
    },
    [listings],
  );

  const runHavenTurn = React.useCallback(
    async (body: Omit<DreamAiRunTurnRequest, "chatId" | "clientMessageId">) => {
      const clientMessageId = globalThis.crypto?.randomUUID?.() ?? makeId() + makeId();
      const fullBody: DreamAiRunTurnRequest = {
        ...body,
        chatId: chatId ?? undefined,
        clientMessageId,
      };

      const slotId = makeId();
      assistantSlotRef.current = slotId;
      setThreadProblem(null);
      setMessages((prev) => [
        ...prev,
        {
          id: slotId,
          role: "assistant",
          source: "haven",
          turn: emptyTurn(),
          streamingMarkdown: "",
          streaming: true,
        },
      ]);

      const handlers = {
        onDelta: (fragment: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === slotId && m.role === "assistant" && m.source === "haven"
                ? { ...m, streamingMarkdown: m.streamingMarkdown + fragment }
                : m,
            ),
          );
        },
        onFinal: (res: import("@/lib/dream-ai/contracts").DreamAiRunTurnResponse) => {
          applyFinal(slotId, res);
        },
        onProblem: (problem: ProblemDetail) => {
          handleProblem(slotId, problem);
        },
      };

      try {
        await streamDreamAiTurn(fullBody, handlers);
      } catch (err) {
        if (err instanceof DreamAiStreamAbortedError) {
          handleProblem(slotId, { title: "Session", detail: err.message });
          return;
        }
        try {
          const res = await postDreamAiTurn(fullBody, { skipAuth: !getCurrentToken() });
          applyFinal(slotId, res);
        } catch (e2) {
          if (e2 instanceof ApiError) {
            handleProblem(slotId, e2.problem ?? { title: e2.message, status: e2.status });
          } else {
            handleProblem(slotId, { title: "Network error", detail: String(e2) });
          }
        }
      }
    },
    [chatId, applyFinal, handleProblem],
  );

  const runAssistant = React.useCallback(
    async (userText: string) => {
      setProviderIssue(false);
      try {
        await runHavenTurn({ prompt: userText });
      } catch {
        if (!signedIn) await runGuestAssistant(userText);
      }
    },
    [signedIn, runHavenTurn, runGuestAssistant],
  );

  const submit = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setInput("");
      setBusy(true);
      setMessages((prev) => [...prev, { id: makeId(), role: "user", content: trimmed }]);
      void runAssistant(trimmed).finally(() => setBusy(false));
    },
    [busy, runAssistant],
  );

  const initialPromptHandled = React.useRef(false);
  React.useEffect(() => {
    const trimmed = initialPrompt?.trim();
    if (!trimmed || initialPromptHandled.current) return;
    initialPromptHandled.current = true;
    submit(trimmed);
  }, [initialPrompt, submit]);

  const initialCompareHandled = React.useRef(false);
  React.useEffect(() => {
    const ids = initialCompareIds?.filter((id) => Number.isFinite(id)) ?? [];
    if (ids.length < 2 || initialCompareHandled.current || busy) return;
    initialCompareHandled.current = true;
    setBusy(true);
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content: "Compare these for me" }]);
    void runHavenTurn({
      prompt: "Compare these for me",
      compareListingIds: ids.slice(0, 5),
    }).finally(() => setBusy(false));
  }, [initialCompareIds, busy, runHavenTurn]);

  const submitChip = React.useCallback(
    (chip: ChipOption) => {
      if (busy || !signedIn) return;
      setBusy(true);
      setMessages((prev) => [...prev, { id: makeId(), role: "user", content: chip.sendText }]);
      void runHavenTurn({
        prompt: null,
        userChoice: { chipId: chip.id, sendText: chip.sendText },
      }).finally(() => setBusy(false));
    },
    [busy, signedIn, runHavenTurn],
  );

  const reset = () => {
    setMessages([]);
    setInput("");
    setProviderIssue(false);
    setThreadProblem(null);
    setChatId(null);
    assistantSlotRef.current = null;
  };

  const problemStrip = threadProblem ? problemBanner(threadProblem) : null;
  const ext = threadProblem ? (threadProblem as Record<string, unknown>) : null;
  const retrySec =
    ext && typeof ext.retryAfterSeconds === "number" && !Number.isNaN(ext.retryAfterSeconds)
      ? ext.retryAfterSeconds
      : NaN;

  const headerActions = signedIn ? (
    <div className="flex items-center gap-1">
      <DropdownMenu onOpenChange={(o) => o && void loadChatList()}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 pr-2" disabled={chatsLoading}>
            <History className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Chats</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 w-72 overflow-y-auto">
          <DropdownMenuLabel>Past conversations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {chatSummaries.length === 0 ? (
            <DropdownMenuItem disabled>No saved threads yet</DropdownMenuItem>
          ) : (
            chatSummaries.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => void openChat(c.id)}>
                <span className="line-clamp-2 text-left">{c.preview || `Chat #${c.id}`}</span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {hasConversation ? (
        <Button variant="ghost" size="sm" onClick={reset}>
          <Plus className="h-4 w-4" aria-hidden />
          New chat
        </Button>
      ) : null}
    </div>
  ) : hasConversation ? (
    <Button variant="ghost" size="sm" onClick={reset}>
      <Plus className="h-4 w-4" aria-hidden />
      New chat
    </Button>
  ) : null;

  return (
    <div
      className={cn(
        "flex flex-col bg-background text-foreground",
        occupyFullHeight && hasConversation
          ? "h-full min-h-0 flex-1 overflow-hidden"
          : embedded
            ? "min-h-0 flex-1"
            : "min-h-full",
      )}
    >
      {!embedded ? (
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
            <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
            <LogoMark size="sm" />
            <span className="truncate text-xs uppercase tracking-eyebrow text-muted-foreground">Dream AI</span>
          </div>
          {headerActions}
        </header>
      ) : null}

      {embedded ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5 md:px-5">
          <span className="text-xs uppercase tracking-eyebrow text-muted-foreground">Dream AI</span>
          {headerActions}
        </div>
      ) : null}

      {providerIssue ? (
        <div className="shrink-0 border-b border-amber-200/90 bg-amber-50/95 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/50 md:px-6">
          <Alert variant="warning" className="relative border-0 bg-transparent p-0 shadow-none">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-800 dark:text-amber-200" aria-hidden />
            <div>
              <AlertTitle className="text-amber-950 dark:text-amber-50">Live matcher unavailable</AlertTitle>
              <AlertDescription className="mt-1.5 text-amber-900/90 dark:text-amber-100/90">
                The last action hit a degraded or unreachable Haven path. Try again shortly; guests still see local hints
                only.
              </AlertDescription>
              <button
                type="button"
                className="mt-3 text-sm font-medium text-amber-950 underline underline-offset-2 hover:text-amber-800 dark:text-amber-50 dark:hover:text-amber-200"
                onClick={() => setProviderIssue(false)}
              >
                Dismiss
              </button>
            </div>
          </Alert>
        </div>
      ) : null}

      {problemStrip ? (
        <div className="shrink-0 border-b border-destructive/25 bg-destructive/5 px-4 py-3 md:px-6">
          <Alert variant="destructive" className="border-0 bg-transparent p-0 shadow-none">
            <AlertTitle>{problemStrip.title}</AlertTitle>
            <AlertDescription className="mt-1">
              {problemStrip.detail}
              {!Number.isNaN(retrySec) && retrySec > 0 ? (
                <span className="mt-2 block text-xs">Try again in about {retrySec}s.</span>
              ) : null}
            </AlertDescription>
            <button
              type="button"
              className="mt-3 text-sm font-medium underline underline-offset-2"
              onClick={() => setThreadProblem(null)}
            >
              Dismiss
            </button>
          </Alert>
        </div>
      ) : null}

      {hasConversation ? (
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <Thread className="min-h-0 flex-1 overflow-hidden">
            <ThreadContent className="mx-auto w-full max-w-3xl">
              {messages.map((m) =>
                m.role === "user" ? (
                  <Message key={m.id} from="user">
                    <MessageStack>
                      <MessageContent>{m.content}</MessageContent>
                    </MessageStack>
                  </Message>
                ) : m.source === "guest" ? (
                  <Message key={m.id} from="assistant">
                    <MessageAvatar fallback={<Sparkles className="h-4 w-4" aria-hidden />} />
                    <MessageStack>
                      <MessageContent>
                        {m.content ? (
                          <MessageMarkdown>{m.content}</MessageMarkdown>
                        ) : (
                          <TextShimmer duration={1.4} className="text-sm text-muted-foreground">
                            Reading your brief…
                          </TextShimmer>
                        )}
                      </MessageContent>
                      {!m.streaming && m.matches.length > 0 ? (
                        <div className="flex w-full flex-col gap-2">
                          {m.matches.map((match) => (
                            <InlineListing key={match.listing.id} listing={match.listing} />
                          ))}
                        </div>
                      ) : null}
                    </MessageStack>
                  </Message>
                ) : (
                  <Message key={m.id} from="assistant">
                    <MessageAvatar fallback={<Sparkles className="h-4 w-4" aria-hidden />} />
                    <MessageStack>
                      <MessageContent>
                        <AssistantTurnPanel
                          turn={m.turn}
                          listings={listings}
                          streamingMarkdown={m.streamingMarkdown}
                          streaming={m.streaming}
                          onChip={signedIn ? submitChip : undefined}
                        />
                      </MessageContent>
                    </MessageStack>
                  </Message>
                ),
              )}
            </ThreadContent>
            <ThreadScrollToBottom />
          </Thread>

          <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur">
            <div className="mx-auto w-full max-w-3xl px-4 py-4 md:px-6">
              {userMessageCount >= 3 && !signedIn ? (
                <div className="mb-4 border border-accent/20 bg-accent/5 p-4">
                  <p className="text-sm font-medium text-foreground">Sign in for live Dream AI threads</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create an account to save chats, clarify with chips, and sync with Haven&apos;s matcher.
                  </p>
                  <div className="mt-3">
                    <Link href="/login?next=/dream-ai" className="text-sm font-medium text-accent hover:text-accent/80">
                      Log in
                    </Link>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <Link href="/signup?next=/dream-ai" className="text-sm font-medium text-accent hover:text-accent/80">
                      Sign up
                    </Link>
                  </div>
                </div>
              ) : null}
              <ChatPromptInput input={input} setInput={setInput} onSubmit={submit} busy={busy} />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Dream AI ranks over a curated Lagos &amp; Abuja slice, suggestions, not exhaustive search. Verify with the
                lister before signing.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <DreamAiWelcomeBanner signedIn={signedIn} />

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-4 py-8 md:px-6 md:py-10">
            <div className="w-full">
              <ChatPromptInput input={input} setInput={setInput} onSubmit={submit} busy={busy} />
            </div>

            <Suggestions onSelect={(value) => submit(value)} className="w-full items-center">
              <SuggestionList className={embedded ? "justify-center" : undefined}>
                {STARTER_PROMPTS.map((s) => (
                  <Suggestion key={s} variant="outline">
                    {s}
                  </Suggestion>
                ))}
              </SuggestionList>
            </Suggestions>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Dream AI ranks over a curated Lagos &amp; Abuja slice, suggestions, not exhaustive search. Verify with the
              lister before signing.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}

function ChatPromptInput({
  input,
  setInput,
  onSubmit,
  busy,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (v: string) => void;
  busy: boolean;
}) {
  return (
    <PromptInput onSubmit={onSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="3-bedroom in Lekki Phase 1, under ₦8M/year…"
        disabled={busy}
      />
      <PromptInputActions>
        <PromptInputActionGroup />
        <PromptInputActionGroup>
          <PromptInputAction tooltip="Send (Enter)" asChild>
            <button
              type="button"
              onClick={() => onSubmit(input)}
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
