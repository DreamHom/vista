"use client";

import { useRef, type ReactNode } from "react";

export type SortOption = { value: string; label: string };

const SELECT_CLASS =
  "h-11 w-full min-w-0 rounded-none border border-border bg-background pl-4 pr-14 text-sm text-foreground outline-none transition-colors focus:border-foreground";

/**
 * Sort `<select>` that submits its parent form on change so we do not need a separate Apply button.
 */
export function SortAutoSubmitForm({
  action,
  appliedSort,
  options,
  label,
  children,
  className,
}: {
  action: string;
  appliedSort: string;
  options: readonly SortOption[];
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} method="get" className={className}>
      {children}
      <label className="flex w-full min-w-0 flex-1 flex-col gap-1.5 text-xs font-medium text-muted-foreground sm:min-w-[12rem]">
        {label}
        <select
          name="sort"
          key={appliedSort}
          defaultValue={appliedSort}
          onChange={() => formRef.current?.requestSubmit()}
          className={SELECT_CLASS}
          aria-label={label}
        >
          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
