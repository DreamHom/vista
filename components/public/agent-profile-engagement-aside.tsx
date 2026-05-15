"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

function AsideShell({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-card p-6">
      <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-6 min-w-0">{children}</div>
    </section>
  );
}

export function AgentProfileEngagementAside({ agentId, agentName }: { agentId: string; agentName: string }) {
  const { user, hydrated, isAuthenticated, role } = useAuth();
  const firstName = agentName.trim().split(/\s+/)[0] ?? agentName;
  const isSelf = Boolean(user && String(user.id) === agentId);

  if (!hydrated) {
    return (
      <section className="border border-border bg-card p-6" aria-busy="true" aria-label="Loading">
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-5 w-full max-w-[14rem] animate-pulse rounded bg-muted" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-6 h-11 w-full animate-pulse rounded bg-muted" />
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <AsideShell
        eyebrow="Get this agent"
        title={`Work with ${firstName} on DreamHomes`}
        body="Create a free account to book viewings, send messages, and make offers. Everything stays on-platform for you and the agent."
      >
        <div className="flex flex-col gap-3">
          <Link
            href={`/signup?next=${encodeURIComponent(`/agents/${agentId}`)}`}
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center text-center")}
          >
            Create free account
          </Link>
          <Link
            href={`/login?next=${encodeURIComponent(`/agents/${agentId}`)}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-center")}
          >
            Log in
          </Link>
        </div>
      </AsideShell>
    );
  }

  if (isSelf) {
    if (role === "AGENT") {
      return (
        <AsideShell
          eyebrow="Your public profile"
          title="How clients see you"
          body="Keep your workspace profile and listings up to date so this page stays accurate when people share your link."
        >
          <Link
            href="/agent"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "flex w-full justify-center text-center")}
          >
            Open agent workspace
          </Link>
        </AsideShell>
      );
    }
    return (
      <AsideShell
        eyebrow="Your account"
        title="You are viewing your public profile"
        body="Use your dashboard to manage notifications, saved homes, and verification."
      >
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "primary", size: "lg" }), "flex w-full justify-center text-center")}
        >
          Go to dashboard
        </Link>
      </AsideShell>
    );
  }

  if (role === "APPLICANT") {
    return (
      <AsideShell
        eyebrow="Interested?"
        title={`Homes from ${firstName}`}
        body="You are signed in. Jump to the listings on this page, browse the wider marketplace, or open your dashboard to continue a viewing or offer."
      >
        <div className="flex flex-col gap-3">
          <Link
            href={`/agents/${agentId}#agent-represented-listings`}
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center text-center")}
          >
            View their listings
          </Link>
          <Link
            href="/listings"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-center")}
          >
            Browse all listings
          </Link>
          <Link href="/dashboard" className="text-center text-sm font-medium text-primary hover:text-primary/80">
            Go to my dashboard
          </Link>
        </div>
      </AsideShell>
    );
  }

  if (role === "OWNER") {
    return (
      <AsideShell
        eyebrow="Hire this agent"
        title={`Invite ${firstName} to your listing`}
        body="From your owner workspace you can request agent coverage on a property you publish. They accept or decline in-app—no cold DMs required."
      >
        <div className="flex flex-col gap-3">
          <Link
            href="/owner/agents"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center text-center")}
          >
            Manage agent requests
          </Link>
          <Link
            href={`/agents/${agentId}#agent-represented-listings`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-center")}
          >
            Preview their listings
          </Link>
        </div>
      </AsideShell>
    );
  }

  if (role === "AGENT") {
    return (
      <AsideShell
        eyebrow="Colleague profile"
        title={`About ${firstName}`}
        body="You are signed in as an agent. Use the directory to compare peers, or open this agent’s listings below when you are helping a client."
      >
        <div className="flex flex-col gap-3">
          <Link
            href="/agents"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full justify-center text-center")}
          >
            Back to agent directory
          </Link>
          <Link
            href={`/agents/${agentId}#agent-represented-listings`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-center")}
          >
            Their active listings
          </Link>
        </div>
      </AsideShell>
    );
  }

  if (role === "ADMIN") {
    return (
      <AsideShell
        eyebrow="Internal view"
        title="Signed in as admin"
        body="This is the same public profile visitors see. Use your admin tools for moderation or support tasks."
      >
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "flex w-full justify-center text-center")}
        >
          Open admin
        </Link>
      </AsideShell>
    );
  }

  return (
    <AsideShell
      eyebrow="Signed in"
      title={`${firstName} on DreamHomes`}
      body="Continue from your workspace, or browse the listings this agent represents below."
    >
      <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "flex w-full justify-center")}>
        Go to dashboard
      </Link>
    </AsideShell>
  );
}
