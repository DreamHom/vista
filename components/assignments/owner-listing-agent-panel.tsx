"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { OwnerAssignmentCard } from "@/components/assignments/owner-assignment-card";
import { FieldLabel } from "@/components/owner/pages/owner-page-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  assignmentInviteBlockedMessage,
  assignmentInviteErrorMessage,
  getListingAssignmentBlockers,
  isTerminalAssignmentStatus,
  ownerCanInviteAgent,
} from "@/lib/assignment-lifecycle";
import { inviteAgentToListing, searchAssignableAgents, type AgentListingResponse } from "@/lib/owner-dashboard";
import type { PublicUserProfile } from "@/lib/applicant-dashboard";

export type OwnerListingAssignmentRow = {
  assignment: AgentListingResponse;
  agentProfile: PublicUserProfile | null;
};

export function OwnerListingAgentPanel({
  listingId,
  listingTitle,
  listingLocation,
  propertyHref,
  assignments,
  onChanged,
}: {
  listingId: number;
  listingTitle: string;
  listingLocation?: string | null;
  propertyHref: string;
  assignments: OwnerListingAssignmentRow[];
  onChanged: () => void | Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const assignmentRows = useMemo(() => assignments.map((row) => row.assignment), [assignments]);
  const blockers = useMemo(() => getListingAssignmentBlockers(assignmentRows), [assignmentRows]);
  const canInvite = ownerCanInviteAgent(blockers);
  const blockedMessage = assignmentInviteBlockedMessage(blockers);

  const currentAssignments = assignments.filter((row) => !isTerminalAssignmentStatus(row.assignment.status));
  const pastAssignments = assignments.filter((row) => isTerminalAssignmentStatus(row.assignment.status));

  const agentSearchQuery = useQuery({
    queryKey: ["owner-agent-search", listingId, searchTerm],
    queryFn: () => searchAssignableAgents(searchTerm),
    enabled: canInvite && searchTerm.trim().length >= 2,
  });

  const inviteMutation = useMutation({
    mutationFn: (agentId: number) => inviteAgentToListing(listingId, agentId),
    onSuccess: async () => {
      toast.success("Agent invitation sent.");
      setSearchTerm("");
      await onChanged();
    },
    onError: (error) =>
      toast.error(assignmentInviteErrorMessage(error, "We couldn't send that agent invitation.")),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        One pending invite and one active agent per listing at a time. End the current assignment row before inviting
        someone new.
      </p>

      {blockedMessage ? (
        <div className="border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">{blockedMessage}</div>
      ) : null}

      {currentAssignments.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Current assignment</p>
          {currentAssignments.map((item) => (
            <OwnerAssignmentCard
              key={item.assignment.id}
              assignment={item.assignment}
              agentName={item.agentProfile?.fullName ?? `Agent #${item.assignment.agentUserId}`}
              listingTitle={listingTitle}
              listingLocation={listingLocation}
              propertyHref={propertyHref}
              onChanged={onChanged}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No active or pending agent on this listing.</p>
      )}

      <div className="space-y-2 border border-border bg-secondary/20 p-4">
        <FieldLabel>Find an agent to invite</FieldLabel>
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or location"
          disabled={!canInvite || inviteMutation.isPending}
        />
        {!canInvite ? (
          <p className="text-xs text-muted-foreground">Invites are disabled until the current row is withdrawn or revoked.</p>
        ) : null}

        {canInvite && agentSearchQuery.data?.length ? (
          <div className="space-y-3">
            {agentSearchQuery.data.slice(0, 4).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between gap-3 border border-border bg-background p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.verified ? "Verified agent" : "Agent profile"}
                    {agent.averageRating ? ` · ${agent.averageRating.toFixed(1)} rating` : " · New on DreamHomes"}
                  </p>
                </div>
                <Button
                  onClick={() => inviteMutation.mutate(Number(agent.id))}
                  disabled={inviteMutation.isPending}
                >
                  Invite
                </Button>
              </div>
            ))}
          </div>
        ) : canInvite && searchTerm.trim().length >= 2 && !agentSearchQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">No agents matched that search yet.</p>
        ) : null}
      </div>

      {pastAssignments.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Past assignments</p>
          {pastAssignments.map((item) => (
            <OwnerAssignmentCard
              key={item.assignment.id}
              assignment={item.assignment}
              agentName={item.agentProfile?.fullName ?? `Agent #${item.assignment.agentUserId}`}
              listingTitle={listingTitle}
              listingLocation={listingLocation}
              propertyHref={propertyHref}
              onChanged={onChanged}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
