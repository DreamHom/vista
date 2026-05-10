import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "brand"
  | "accent"
  | "success"
  | "warn"
  | "danger"
  | "verified"
  | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-bg-sunken text-fg border-border",
  brand: "bg-brand-soft text-brand border-brand/15",
  accent: "bg-accent-soft text-accent-fg border-accent/30",
  success: "bg-success-soft text-success border-success/20",
  warn: "bg-warn-soft text-warn border-warn/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  verified: "bg-verified-soft text-verified border-verified/20",
  muted: "bg-bg-sunken text-fg-muted border-border",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  leadingIcon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  leadingIcon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {leadingIcon}
      {children}
    </span>
  );
}

export function VerifiedBadge({
  kind,
  className,
}: {
  kind: "owner" | "documents" | "agent" | "applicant";
  className?: string;
}) {
  const label =
    kind === "owner"
      ? "Owner verified"
      : kind === "documents"
        ? "Documents verified"
        : kind === "agent"
          ? "Verified agent"
          : "Trusted applicant";
  return (
    <Badge
      tone="verified"
      className={className}
      leadingIcon={
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12l2 2 4-4" />
          <path d="M12 22s8-4 8-12V5l-8-3-8 3v5c0 8 8 12 8 12z" />
        </svg>
      }
    >
      {label}
    </Badge>
  );
}
