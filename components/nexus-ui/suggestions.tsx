"use client";

/**
 * Suggestions: Nexus UI port (Suggestions / SuggestionList / Suggestion).
 *
 * Source: https://nexus-ui.dev/docs/components/suggestions
 *
 * Trimmed to the inline trio: the upstream component also ships a
 * floating SuggestionPanel built on `@radix-ui/react-presence`, which we
 * don't need for the Dream AI page (suggestions sit statically above the
 * prompt input).
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const suggestionVariants = cva(
  "h-8 gap-1.5 px-3 text-sm font-normal transition-colors duration-150 active:scale-[0.99]",
  {
    variants: {
      variant: {
        filled: "border-none bg-muted text-foreground hover:bg-border",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-muted",
        ghost:
          "border-none bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "filled",
    },
  },
);

type SuggestionsContextValue = {
  onSelect?: (value: string) => void;
};

const SuggestionsContext = React.createContext<SuggestionsContextValue>({});

type SuggestionsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> & {
  onSelect?: (value: string) => void;
};

export function Suggestions({
  className,
  onSelect,
  ...props
}: SuggestionsProps) {
  return (
    <SuggestionsContext.Provider value={{ onSelect }}>
      <div
        data-slot="suggestions"
        role="group"
        aria-label="Suggestions"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </SuggestionsContext.Provider>
  );
}

type SuggestionListProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function SuggestionList({
  className,
  orientation = "horizontal",
  ...props
}: SuggestionListProps) {
  return (
    <div
      data-slot="suggestion-list"
      role="group"
      aria-label="Suggestions"
      className={cn(
        "flex gap-2",
        orientation === "horizontal"
          ? "flex-row flex-wrap items-center justify-center"
          : "flex-col items-start",
        className,
      )}
      {...props}
    />
  );
}

type SuggestionProps = Omit<React.ComponentProps<typeof Button>, "variant"> &
  VariantProps<typeof suggestionVariants> & {
    value?: string;
  };

export function Suggestion({
  className,
  value,
  variant = "filled",
  onClick,
  children,
  ...props
}: SuggestionProps) {
  const { onSelect } = React.useContext(SuggestionsContext);

  return (
    <Button
      data-slot="suggestion"
      className={cn(suggestionVariants({ variant }), className)}
      onClick={(e) => {
        onClick?.(e);
        const text = value ?? (typeof children === "string" ? children : "");
        if (text && onSelect) onSelect(text);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
