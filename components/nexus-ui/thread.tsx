"use client";

/**
 * Thread: Nexus UI port. Source: https://nexus-ui.dev/docs/components/thread
 *
 * Stick-to-bottom scrolling chat viewport. Lightly adapted for DreamHomes:
 * `@hugeicons/react` swapped for `lucide-react` (we already ship lucide for
 * the rest of the app, no reason to pull a second icon set), and the
 * `size-4.5` Tailwind-v4-ism replaced with `h-4 w-4` since we're on v3.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown } from "lucide-react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { cn } from "@/lib/utils";

type ThreadProps = React.ComponentProps<typeof StickToBottom>;

function Thread({
  className,
  resize = "smooth",
  initial = "smooth",
  ...props
}: ThreadProps) {
  return (
    <StickToBottom
      data-slot="thread"
      className={cn("relative h-full w-full", className)}
      resize={resize}
      initial={initial}
      {...props}
    />
  );
}

type ThreadContentProps = React.ComponentProps<typeof StickToBottom.Content>;

function ThreadContent({ className, ...props }: ThreadContentProps) {
  return (
    <StickToBottom.Content
      data-slot="thread-content"
      className={cn("flex w-full flex-col gap-6 p-6", className)}
      {...props}
    />
  );
}

type ThreadScrollToBottomProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
};

function ThreadScrollToBottom({
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: ThreadScrollToBottomProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="thread-scroll-to-bottom"
      type={asChild ? undefined : "button"}
      className={cn(
        !asChild &&
          "absolute bottom-6 left-1/2 flex h-9 w-9 -translate-x-1/2 cursor-pointer items-center justify-center border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-secondary active:scale-95",
        className,
      )}
      onClick={(event) => {
        scrollToBottom();
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronDown className="h-4 w-4" aria-hidden />}
    </Comp>
  );
}

export { Thread, ThreadContent, ThreadScrollToBottom };
