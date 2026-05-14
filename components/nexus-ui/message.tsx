"use client";

/**
 * Message: slim local rendition inspired by Nexus UI's Message.
 *
 * The official component pulls in Streamdown (+ math + mermaid + CJK + code
 * highlighting) which is overkill for our property assistant: the AI just
 * writes short paragraphs and we drop listing cards inline as JSX. Keeping
 * this small means no extra runtime cost on a marketing-adjacent page.
 *
 * API mirrors Nexus where it overlaps so swapping in the full version later
 * is a one-import change.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

type From = "user" | "assistant";

type MessageProps = React.HTMLAttributes<HTMLDivElement> & {
  from: From;
};

const MessageContext = React.createContext<From>("assistant");

export function Message({ from, className, children, ...props }: MessageProps) {
  return (
    <MessageContext.Provider value={from}>
      <div
        data-slot="message"
        data-from={from}
        aria-label={from === "user" ? "User message" : "Assistant message"}
        className={cn(
          "group flex w-full gap-3",
          from === "user" ? "flex-row-reverse" : "flex-row",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </MessageContext.Provider>
  );
}

export function MessageStack({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const from = React.useContext(MessageContext);
  return (
    <div
      data-slot="message-stack"
      className={cn(
        "flex max-w-[85%] flex-col gap-2",
        from === "user" ? "items-end" : "items-start",
        className,
      )}
      {...props}
    />
  );
}

export function MessageContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const from = React.useContext(MessageContext);
  return (
    <div
      data-slot="message-content"
      className={cn(
        "px-4 py-3 text-sm leading-relaxed",
        from === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Lightweight markdown renderer. Supports paragraphs, **bold**, *italic*,
 * `inline code`, and bullet lists: that's all the AI emits for our use case.
 * If we ever need fenced code blocks or tables, swap this for the Streamdown
 * version in the real Nexus component.
 */
export function MessageMarkdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-2 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_strong]:font-semibold",
        className,
      )}
    >
      {parseLines(children)}
    </div>
  );
}

function parseLines(src: string) {
  const blocks: React.ReactNode[] = [];
  const lines = src.split(/\n+/);
  let listBuf: string[] | null = null;

  const flushList = (key: string) => {
    if (!listBuf) return;
    blocks.push(
      <ul key={key} className="ml-5 list-disc space-y-1">
        {listBuf.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listBuf = null;
  };

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`l-${i}`);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuf = listBuf ?? [];
      listBuf.push(line.slice(2));
      return;
    }
    flushList(`l-${i}`);
    blocks.push(<p key={`p-${i}`}>{renderInline(line)}</p>);
  });
  flushList("l-final");

  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  // Order matters: process **bold**, then *italic*, then `code`.
  const out: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("`")) {
      out.push(<code key={k++}>{tok.slice(1, -1)}</code>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function MessageAvatar({
  fallback,
  className,
}: {
  fallback: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center bg-secondary text-xs font-medium uppercase tracking-eyebrow text-muted-foreground",
        className,
      )}
    >
      {fallback}
    </div>
  );
}
