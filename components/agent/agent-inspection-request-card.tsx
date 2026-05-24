"use client";

import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { workspaceLocalStatusVariant } from "@/lib/inspection-lifecycle";
import type { AgentInspectionDecision, AgentInspectionItem } from "@/lib/agent-dashboard";

interface AgentInspectionRequestCardProps {
  item: AgentInspectionItem;
  pending: boolean;
  onSave: (decision: AgentInspectionDecision) => void;
}

export function AgentInspectionRequestCard({ item, pending, onSave }: AgentInspectionRequestCardProps) {
  const isPending = item.localStatus === "pending" && !item.noShow;
  const isApproved = item.localStatus === "approved" && !item.noShow;
  const isTerminal =
    item.localStatus === "cancelled" || item.localStatus === "completed" || item.noShow;

  function baseDecision(): AgentInspectionDecision {
    return {
      status: item.localStatus,
      note: item.note,
      noShow: item.noShow,
      rescheduleAt: item.rescheduleAt,
    };
  }

  const badgeVariant = item.noShow ? "outline" : workspaceLocalStatusVariant(item.localStatus);

  return (
    <Card className="border-border shadow-none">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{item.listing?.title ?? "Managed listing"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.applicantName} • {formatDateTime(item.requestedAt)}
            </p>
          </div>
          <StatusBadge label={item.statusLabel} variant={badgeVariant} />
        </div>

        <p className="border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
          Preview only: actions save on this device. Haven notifies the applicant when the owner approves or declines
          on their dashboard.
        </p>

        {isTerminal ? (
          <p className="text-sm text-muted-foreground">
            {item.noShow
              ? "Marked as no-show in your local queue."
              : item.localStatus === "cancelled"
                ? "Declined in your local queue."
                : "Visit marked complete locally."}
          </p>
        ) : null}

        <Textarea
          rows={3}
          defaultValue={item.note}
          placeholder="Add interest level, observations, or a concise visit summary."
          onBlur={(event) => onSave({ ...baseDecision(), note: event.target.value })}
        />

        {isPending ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={pending}
              onClick={() => onSave({ ...baseDecision(), status: "approved", noShow: false })}
            >
              Mark approved (local)
            </Button>
            <InspectionMoreMenu
              disabled={pending}
              menuLabel="Decline is local preview only. The applicant is not notified on Haven."
              items={[
                {
                  id: "decline",
                  label: "Decline request (local)",
                  description: "Rehearse the queue layout. Owner decline on Haven is required to notify the applicant.",
                  destructive: true,
                  onSelect: () => onSave({ ...baseDecision(), status: "cancelled", noShow: false }),
                },
              ]}
            />
          </div>
        ) : null}

        {isApproved ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              variant="primary"
              disabled={pending}
              onClick={() => onSave({ ...baseDecision(), status: "completed", noShow: false })}
            >
              Mark completed (local)
            </Button>
            <InspectionMoreMenu
              disabled={pending}
              menuLabel="No-show is local until agent Haven endpoints ship."
              items={[
                {
                  id: "no-show",
                  label: "Mark no-show (local)",
                  description: "Owners can record no-show on Haven for approved visits.",
                  destructive: true,
                  onSelect: () => onSave({ ...baseDecision(), noShow: true }),
                },
              ]}
            />
            <Input
              type="datetime-local"
              className="max-w-xs"
              defaultValue={item.rescheduleAt}
              onBlur={(event) => onSave({ ...baseDecision(), rescheduleAt: event.target.value })}
              aria-label="Reschedule note (local)"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
