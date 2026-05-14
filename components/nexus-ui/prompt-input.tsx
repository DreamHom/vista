"use client";

/**
 * PromptInput: slim local rendition of Nexus UI's PromptInput.
 *
 * The official component depends on shadcn `tooltip`, `kbd`, `scroll-area`,
 * none of which we ship today. We keep the same context-based API
 * (`<PromptInput onSubmit>` + `<PromptInputTextarea />` + actions) so the
 * usage pattern matches the docs, but drop the tooltip/kbd plumbing on
 * actions: we render plain buttons.
 *
 * Behavior contract (matches Nexus):
 *   Enter         → submit
 *   Shift+Enter   → newline
 *   Click chrome  → focus textarea
 *
 * Textarea starts at one line tall, grows with content up to five lines, then
 * scrolls inside the field.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type Ctx = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit?: (value: string) => void;
};

const PromptInputContext = React.createContext<Ctx | null>(null);

type PromptInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSubmit"
> & {
  onSubmit?: (value: string) => void;
};

export function PromptInput({
  className,
  onClick,
  onSubmit,
  ...props
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('button, a, input, textarea, [role="button"]')
      ) {
        textareaRef.current?.focus();
      }
      onClick?.(e);
    },
    [onClick],
  );

  const value = React.useMemo<Ctx>(
    () => ({ textareaRef, onSubmit }),
    [onSubmit],
  );

  return (
    <PromptInputContext.Provider value={value}>
      <div
        role="group"
        aria-label="Chat input"
        onClick={handleClick}
        className={cn(
          "relative flex w-full cursor-text flex-col gap-0 border border-border bg-card",
          className,
        )}
        {...props}
      />
    </PromptInputContext.Provider>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function PromptInputTextarea(
  {
    className,
    onKeyDown,
    onInput,
    placeholder = "How can I help you today?",
    value,
    defaultValue,
    ...props
  },
  ref,
) {
  const ctx = React.useContext(PromptInputContext);
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight);
    const line = Number.isFinite(lh) && lh > 0 ? lh : 24;
    const padY =
      (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const single = line + padY;
    const max = line * 5 + padY;
    el.style.height = "auto";
    const sh = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(sh, single), max)}px`;
  }, []);

  React.useLayoutEffect(() => {
    adjustHeight();
  }, [value, defaultValue, adjustHeight]);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (ctx?.textareaRef) {
        (ctx.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
      }
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    },
    [ctx, ref],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && ctx?.onSubmit) {
      e.preventDefault();
      ctx.onSubmit(e.currentTarget.value);
    }
    onKeyDown?.(e);
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onInput?.(e);
  };

  return (
    <textarea
      ref={setRefs}
      aria-label="Message input"
      placeholder={placeholder}
      rows={1}
      {...props}
      {...(value !== undefined
        ? { value }
        : defaultValue !== undefined
          ? { defaultValue }
          : {})}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className={cn(
        // One text line + compact vertical padding; grows to five lines via
        // adjustHeight, then overflow-y-auto scrolls inside the fixed cap.
        "block min-h-0 w-full resize-none overflow-y-auto border-0 bg-transparent px-4 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:outline-none",
        className,
      )}
    />
  );
});

export function PromptInputActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-label="Input actions"
      className={cn(
        "flex w-full shrink-0 items-center justify-between gap-2 px-2 py-2",
        className,
      )}
      {...props}
    />
  );
}

export function PromptInputActionGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-2", className)} {...props} />;
}

type PromptInputActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  tooltip?: string;
};

export function PromptInputAction({
  asChild = false,
  tooltip,
  ...props
}: PromptInputActionProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp title={tooltip} {...props} />;
}
