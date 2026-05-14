"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DashboardPageIntroProps = {
  eyebrow?: string;
  title: string;
  /** Ignored: kept on the type so existing call sites stay valid without rendering repetitive blurbs. */
  description?: string;
  actions?: React.ReactNode;
};

export function DashboardPageIntro(props: DashboardPageIntroProps) {
  const { eyebrow, title, actions } = props;
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-eyebrow text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "accent";
}) {
  return (
    <Card
      className={cn(
        "border-border/70 shadow-none",
        tone === "accent"
          ? "border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(184,121,62,0.12),transparent_35%),#fff]"
          : "bg-white",
      )}
    >
      <CardHeader className="pb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 bg-white shadow-none", className)}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function EmptyPanel({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">{body}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorPanel({
  title = "We couldn’t load this section",
  body,
  retryLabel = "Try again",
  onRetry,
}: {
  title?: string;
  body: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="text-sm leading-7 text-muted-foreground">{body}</p>
          </div>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LoadingPanel({ label = "Loading your workspace..." }: { label?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function StatusBadge({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: "default" | "success" | "outline" | "secondary" | "warning";
}) {
  return <Badge variant={variant}>{label}</Badge>;
}

export function SettingsToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 sm:gap-5 sm:py-4">
      <button
        type="button"
        className="min-w-0 flex-1 cursor-pointer rounded-md border-0 bg-transparent px-1 py-1 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => onCheckedChange(!checked)}
      >
        <span className="block text-sm font-medium leading-snug text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{description}</span>
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-11 shrink-0 items-center rounded-[9999px] px-1.5 py-1 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "justify-end bg-primary" : "justify-start bg-muted",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none block h-4 w-4 rounded-[9999px] bg-white shadow-sm ring-1 ring-black/[0.08]"
        />
      </button>
    </div>
  );
}
