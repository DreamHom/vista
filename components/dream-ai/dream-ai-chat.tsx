"use client";

/**
 * Dream AI chat shell.
 *
 * Conversation flow:
 *  - Empty state: oversize headline + curated suggestion chips + input
 *  - Conversation state: Thread scrolls messages; input sticks at bottom
 *
 * The "AI" is local: `lib/dream-ai/match.ts` parses the prompt and ranks
 * listings out of `LISTINGS`. Streaming is faked by chunking the composed
 * reply word-by-word so the typing feels real. When haven exposes a real
 * `/api/dream-ai` endpoint we'll swap the `runAssistant` function for a
 * fetch + `useChat`-style transport and the UI doesn't have to move.
 */

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Sparkles, Plus } from "lucide-react";

import { LogoMark } from "@/components/logo";
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
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
import {
  Suggestions,
  SuggestionList,
  Suggestion,
} from "@/components/nexus-ui/suggestions";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { InlineListing } from "./inline-listing";
import {
  composeReply,
  parseQuery,
  rankMatches,
  type ScoredMatch,
} from "@/lib/dream-ai/match";
import type { PublicListing } from "@/lib/seed/public-data";

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      content: string;
      matches: ScoredMatch[];
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

/**
 * Streams the reply word-by-word so the AI feels alive. Chunk size and
 * cadence are intentionally human-paced (≈30 chars/s).
 */
async function* streamReply(text: string) {
  const tokens = text.split(/(\s+)/); // keep whitespace as separate tokens
  for (const tok of tokens) {
    await new Promise((r) => setTimeout(r, 14 + Math.random() * 28));
    yield tok;
  }
}

export function DreamAiChat({
  embedded = false,
  listings,
  occupyFullHeight = false,
  onConversationChange,
}: {
  embedded?: boolean;
  listings: PublicListing[];
  /** When true, stretch to fill a flex parent (immersive layout on /dream-ai). */
  occupyFullHeight?: boolean;
  /** Fires when the thread becomes non-empty or returns to empty (new chat). */
  onConversationChange?: (active: boolean) => void;
}) {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [busy, setBusy] = React.useState(false);
  const hasConversation = messages.length > 0;
  const userMessageCount = messages.filter((message) => message.role === "user").length;

  React.useEffect(() => {
    onConversationChange?.(hasConversation);
  }, [hasConversation, onConversationChange]);

  const runAssistant = React.useCallback(async (userText: string) => {
    const parsed = parseQuery(userText);
    const matches = rankMatches(parsed, listings, 3);
    const full = composeReply(parsed, matches);

    const id = makeId();
    setMessages((prev) => [
      ...prev,
      { id, role: "assistant", content: "", matches, streaming: true },
    ]);

    // Pull at least a short pause first so the "thinking…" beat reads.
    await new Promise((r) => setTimeout(r, 350));

    let buffer = "";
    for await (const chunk of streamReply(full)) {
      buffer += chunk;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id && m.role === "assistant" ? { ...m, content: buffer } : m,
        ),
      );
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id && m.role === "assistant" ? { ...m, streaming: false } : m,
      ),
    );
    setBusy(false);
  }, [listings]);

  const submit = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setInput("");
      setBusy(true);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "user", content: trimmed },
      ]);
      void runAssistant(trimmed);
    },
    [busy, runAssistant],
  );

  const reset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background text-foreground",
        occupyFullHeight ? "min-h-0 flex-1" : "min-h-full",
      )}
    >
      {/* Top bar */}
      {!embedded ? (
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
            <span className="h-4 w-px bg-border" aria-hidden />
            <LogoMark size="sm" />
            <span className="text-xs uppercase tracking-eyebrow text-muted-foreground">
              Dream AI
            </span>
          </div>
          {hasConversation ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <Plus className="h-4 w-4" aria-hidden />
              New chat
            </Button>
          ) : null}
        </header>
      ) : null}

      {embedded && hasConversation ? (
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2.5 md:px-5">
          <span className="text-xs uppercase tracking-eyebrow text-muted-foreground">Dream AI</span>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={reset}>
            <Plus className="h-4 w-4" aria-hidden />
            New chat
          </Button>
        </div>
      ) : null}

      {/* Body: empty state OR conversation */}
      {hasConversation ? (
        <main className="relative flex min-h-0 flex-1 flex-col">
          <Thread className="min-h-0 flex-1">
            <ThreadContent className="mx-auto w-full max-w-3xl">
              {messages.map((m) =>
                m.role === "user" ? (
                  <Message key={m.id} from="user">
                    <MessageStack>
                      <MessageContent>{m.content}</MessageContent>
                    </MessageStack>
                  </Message>
                ) : (
                  <Message key={m.id} from="assistant">
                    <MessageAvatar
                      fallback={<Sparkles className="h-4 w-4" aria-hidden />}
                    />
                    <MessageStack>
                      <MessageContent>
                        {m.content ? (
                          <MessageMarkdown>{m.content}</MessageMarkdown>
                        ) : (
                          <TextShimmer
                            duration={1.4}
                            className="text-sm text-muted-foreground"
                          >
                            Reading your brief…
                          </TextShimmer>
                        )}
                      </MessageContent>
                      {!m.streaming && m.matches.length > 0 ? (
                        <div className="flex w-full flex-col gap-2">
                          {m.matches.map((match) => (
                            <InlineListing
                              key={match.listing.id}
                              listing={match.listing}
                            />
                          ))}
                        </div>
                      ) : null}
                    </MessageStack>
                  </Message>
                ),
              )}
            </ThreadContent>
            <ThreadScrollToBottom />
          </Thread>

          <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
            <div className="mx-auto w-full max-w-3xl px-4 py-4 md:px-6">
              {userMessageCount >= 3 ? (
                <div className="mb-4 border border-accent/20 bg-accent/5 p-4">
                  <p className="text-sm font-medium text-foreground">Create an account to save your preferences.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sign up to keep your shortlist, inspection ideas, and Dream AI guidance in one place.
                  </p>
                  <div className="mt-3">
                    <Link href="/signup?next=/dream-ai" className="text-sm font-medium text-accent hover:text-accent/80">
                      Sign up now
                    </Link>
                  </div>
                </div>
              ) : null}
              <ChatPromptInput
                input={input}
                setInput={setInput}
                onSubmit={submit}
                busy={busy}
              />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Dream AI matches against our curated Lagos & Abuja inventory. Verify all details with the lister before signing.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 items-center">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-4 py-16 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1 text-[11px] uppercase tracking-eyebrow text-muted-foreground">
                <Sparkles className="h-3 w-3" aria-hidden />
                Dream AI · Beta
              </span>
              <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Tell us your{" "}
                <TextShimmer as="span" duration={2.4} className="text-accent">
                  dream home
                </TextShimmer>
                .
              </h1>
              <p className="max-w-xl text-balance text-base text-muted-foreground md:text-lg">
                Describe the home you want: the place, the price, the rooms,
                the feel. We&apos;ll match against verified Lagos and Abuja
                listings.
              </p>
            </div>

            <div className="w-full">
              <ChatPromptInput
                input={input}
                setInput={setInput}
                onSubmit={submit}
                busy={busy}
              />
            </div>

            <Suggestions onSelect={(value) => submit(value)}>
              <SuggestionList>
                {STARTER_PROMPTS.map((s) => (
                  <Suggestion key={s} variant="outline">
                    {s}
                  </Suggestion>
                ))}
              </SuggestionList>
            </Suggestions>
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
