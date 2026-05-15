"use client";

import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground">{children}</label>;
}

export function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-10 w-full border border-input bg-background py-2 pl-3 pr-11 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        props.className,
      )}
    />
  );
}

export function PrototypeNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-primary/20 bg-primary/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 inline-flex h-9 w-9 items-center justify-center border border-primary/20 bg-white">
          <ShieldAlert className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function FilterPills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (next: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "border px-4 py-2 text-sm transition-colors",
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
