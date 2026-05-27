"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { AgentAssignmentInviteCard } from "@/components/assignments/agent-assignment-invite-card";
import { EmptyPanel } from "@/components/dashboard/applicant-ui";
import { buttonVariants } from "@/components/ui/button";
import {
  agentCanRespondToInvite,
  agentHasOperationalAccess,
  agentOperationalBlockedMessage,
  type AgentListingStatus,
} from "@/lib/assignment-lifecycle";
import { cn } from "@/lib/utils";

/**
 * Nielsen: don't show operational controls the backend will 403.
 * Only `ACCEPTED` assignments unlock listing management surfaces.
 */
export function AgentOperationalGate({
  status,
  assignmentId,
  listingId,
  listingTitle,
  ownerName,
  onInviteSettled,
  children,
  className,
}: {
  status: AgentListingStatus;
  assignmentId: number;
  listingId: number;
  listingTitle: string;
  ownerName?: string | null;
  onInviteSettled?: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  if (agentHasOperationalAccess(status)) {
    return <div className={className}>{children}</div>;
  }

  const blocked = agentOperationalBlockedMessage(status);

  if (agentCanRespondToInvite(status)) {
    return (
      <div className={cn("space-y-4", className)}>
        {blocked ? (
          <div className="border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">{blocked}</div>
        ) : null}
        <AgentAssignmentInviteCard
          assignmentId={assignmentId}
          listingTitle={listingTitle}
          ownerName={ownerName}
          onSettled={onInviteSettled}
        />
        <div className="flex flex-wrap gap-2">
          <Link href={`/listings/${listingId}`} className={buttonVariants({ variant: "outline", size: "sm" })} target="_blank">
            Preview public listing
          </Link>
          <Link href="/agent/listings" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back to my listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <EmptyPanel
        title="No access on this listing"
        body={blocked ?? "This assignment is not active."}
        ctaLabel="Back to my listings"
        ctaHref="/agent/listings"
      />
      <div className="mt-4">
        <Link href={`/listings/${listingId}`} className={buttonVariants({ variant: "outline", size: "sm" })} target="_blank">
          View public listing (read-only)
        </Link>
      </div>
    </div>
  );
}
