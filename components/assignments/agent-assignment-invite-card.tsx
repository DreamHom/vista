"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { AssignmentDeclineDialog } from "@/components/assignments/assignment-decline-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { acceptAgentAssignment, declineAgentAssignment } from "@/lib/agent-dashboard";
import { assignmentErrorMessage } from "@/lib/assignment-lifecycle";

export function AgentAssignmentInviteCard({
  assignmentId,
  listingTitle,
  ownerName,
  compact = false,
  onSettled,
}: {
  assignmentId: number;
  listingTitle: string;
  ownerName?: string | null;
  compact?: boolean;
  onSettled?: () => void | Promise<void>;
}) {
  const queryClient = useQueryClient();
  const [declineOpen, setDeclineOpen] = useState(false);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["agent-managed-listings"] }),
      queryClient.invalidateQueries({ queryKey: ["agent-owners"] }),
      queryClient.invalidateQueries({ queryKey: ["agent-dashboard-overview"] }),
      queryClient.invalidateQueries({ queryKey: ["agent-listing-workspace"] }),
    ]);
    await onSettled?.();
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptAgentAssignment(assignmentId),
    onSuccess: async () => {
      toast.success("Assignment accepted — you can manage this listing.");
      await invalidate();
    },
    onError: (error) => toast.error(assignmentErrorMessage(error, "We couldn't accept that invite.")),
  });

  const declineMutation = useMutation({
    mutationFn: (reason: string) => declineAgentAssignment(assignmentId, reason),
    onSuccess: async () => {
      setDeclineOpen(false);
      toast.success("Invite declined. The owner can invite another agent.");
      await invalidate();
    },
    onError: (error) => toast.error(assignmentErrorMessage(error, "We couldn't decline that invite.")),
  });

  const pending = acceptMutation.isPending || declineMutation.isPending;

  return (
    <div className={compact ? "space-y-3" : "border border-border bg-secondary/30 p-4"}>
      {!compact ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Owner assignment invite</p>
          <p className="text-sm text-muted-foreground">
            {ownerName ? `${ownerName} invited you` : "An owner invited you"} to manage{" "}
            <span className="font-medium text-foreground">{listingTitle}</span>. Accept to unlock listing tools, or
            decline with a reason.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {ownerName ?? "Owner"} · invite pending your response
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" disabled={pending} onClick={() => acceptMutation.mutate()}>
          {acceptMutation.isPending ? "Accepting…" : "Accept assignment"}
        </Button>
        <InspectionMoreMenu
          menuLabel="Other responses"
          triggerLabel="More invite actions"
          disabled={pending}
          items={[
            {
              id: "decline",
              label: "Decline invite",
              description: "Requires a reason — the owner sees it on the assignment.",
              destructive: true,
              onSelect: () => setDeclineOpen(true),
            },
          ]}
        />
      </div>

      <AssignmentDeclineDialog
        open={declineOpen}
        onOpenChange={setDeclineOpen}
        listingTitle={listingTitle}
        pending={declineMutation.isPending}
        onConfirm={(reason) => declineMutation.mutate(reason)}
      />
    </div>
  );
}
