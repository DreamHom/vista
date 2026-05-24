"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { AssignmentStatusBadge } from "@/components/assignments/assignment-status-badge";
import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  assignmentEndActionCopy,
  assignmentErrorMessage,
  assignmentStatusHint,
  isTerminalAssignmentStatus,
  ownerCanRevokeAssignment,
} from "@/lib/assignment-lifecycle";
import { formatDateTime } from "@/components/dashboard/utils";
import { revokeAgentAssignment, type AgentListingResponse } from "@/lib/owner-dashboard";
import { cn } from "@/lib/utils";

export function OwnerAssignmentCard({
  assignment,
  agentName,
  listingTitle,
  listingLocation,
  propertyHref,
  onChanged,
  className,
}: {
  assignment: AgentListingResponse;
  agentName: string;
  listingTitle: string;
  listingLocation?: string | null;
  propertyHref: string;
  onChanged: () => void | Promise<void>;
  className?: string;
}) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const revokeMutation = useMutation({
    mutationFn: (reason: string) => revokeAgentAssignment(assignment.id, reason),
    onSuccess: async () => {
      setRevokeOpen(false);
      setRevokeReason("");
      toast.success(endCopy.successToast);
      await onChanged();
    },
    onError: (error) => toast.error(assignmentErrorMessage(error, "We couldn't remove that assignment.")),
  });

  const hint = assignmentStatusHint(assignment.status);
  const terminal = isTerminalAssignmentStatus(assignment.status);
  const canRevoke = ownerCanRevokeAssignment(assignment.status);
  const endCopy = assignmentEndActionCopy(assignment.status);

  return (
    <div className={cn("border border-border bg-secondary/20 p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{agentName}</p>
          <p className="text-sm text-muted-foreground">
            {listingTitle}
            {listingLocation ? ` · ${listingLocation}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Invited {formatDateTime(assignment.requestedAt)}
            {assignment.decidedAt ? ` · decided ${formatDateTime(assignment.decidedAt)}` : ""}
          </p>
        </div>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      {hint ? <p className="mt-3 text-sm text-muted-foreground">{hint}</p> : null}

      {assignment.decisionReason ? (
        <div className="mt-3 border border-border bg-background px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">Decision note</p>
          <p className="mt-1 text-sm text-foreground">{assignment.decisionReason}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={propertyHref} className={buttonVariants({ variant: "primary", size: "sm" })}>
          Open listing
        </Link>
        {!terminal && assignment.status === "REQUESTED" ? (
          <span className="text-sm text-muted-foreground">Awaiting agent response</span>
        ) : null}
        {canRevoke ? (
          <InspectionMoreMenu
            menuLabel="Assignment actions"
            triggerLabel="More assignment actions"
            disabled={revokeMutation.isPending}
            items={[
              {
                id: "revoke",
                label: endCopy.menuLabel,
                description: endCopy.menuDescription,
                destructive: true,
                onSelect: () => setRevokeOpen(true),
              },
            ]}
          />
        ) : null}
      </div>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End assignment with {agentName}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This moves the row to <span className="font-medium text-foreground">Revoked</span>. The agent loses
                  access to privileged listing actions. A reason is required for the audit trail.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={revokeReason}
            onChange={(event) => setRevokeReason(event.target.value)}
            placeholder="e.g. Switching to another agent / listing sold"
            maxLength={1000}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={revokeMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={revokeMutation.isPending || !revokeReason.trim()}
              onClick={() => revokeMutation.mutate(revokeReason.trim())}
            >
              {revokeMutation.isPending ? endCopy.pendingLabel : endCopy.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
