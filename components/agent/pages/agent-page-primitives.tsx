"use client";

import { Sparkles } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDate } from "@/components/dashboard/utils";
import { formatNaira } from "@/lib/format";
import type { AgentPromotionRecord } from "@/lib/agent-dashboard";
import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground">{children}</label>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
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
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
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

export function listingImage(url?: string | null) {
  return url ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85";
}

export function PromotionCard({ promotion }: { promotion: AgentPromotionRecord }) {
  return (
    <div className="border border-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{promotion.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {promotion.type === "PROFILE" ? "Featured agent" : "Featured listing"} for {promotion.durationDays} days
          </p>
        </div>
        <StatusBadge
          label={promotion.status}
          variant={promotion.status === "ACTIVE" ? "success" : promotion.status === "PENDING" ? "warning" : "outline"}
        />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="border border-border bg-secondary/50 px-3 py-3">
          <p className="text-xs uppercase tracking-eyebrow">Cost</p>
          <p className="mt-2 text-base font-semibold text-foreground">{formatNaira(promotion.cost)}</p>
        </div>
        <div className="border border-border bg-secondary/50 px-3 py-3">
          <p className="text-xs uppercase tracking-eyebrow">Views</p>
          <p className="mt-2 text-base font-semibold text-foreground">{promotion.viewsGenerated}</p>
        </div>
        <div className="border border-border bg-secondary/50 px-3 py-3">
          <p className="text-xs uppercase tracking-eyebrow">Ends</p>
          <p className="mt-2 text-base font-semibold text-foreground">{formatDate(promotion.endsAt)}</p>
        </div>
      </div>
    </div>
  );
}
