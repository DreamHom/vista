"use client";

import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { workspaceLocalStatusVariant } from "@/lib/inspection-lifecycle";
import type { OwnerInspectionItem } from "@/lib/owner-dashboard";

interface OwnerInspectionRequestCardProps {
  item: OwnerInspectionItem;
  note: string;
  onNoteChange: (value: string) => void;
  pendingAction: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onMarkCompleted: () => void;
  onMarkNoShow: () => void;
}

export function OwnerInspectionRequestCard({
  item,
  note,
  onNoteChange,
  pendingAction,
  onApprove,
  onDecline,
  onMarkCompleted,
  onMarkNoShow,
}: OwnerInspectionRequestCardProps) {
  const isPending = item.localStatus === "pending";
  const isApproved = item.localStatus === "approved";
  const isTerminal =
    item.localStatus === "cancelled" || item.localStatus === "no_show" || item.localStatus === "completed";

  return (
    <Card className="border-border shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-foreground">{item.applicantName}</p>
              <StatusBadge label={item.statusLabel} variant={workspaceLocalStatusVariant(item.localStatus)} />
            </div>
            <p className="text-sm text-muted-foreground">
              {item.listing?.title ?? "Listing activity"} ·{" "}
              {item.listing?.property.address ?? "Notification-backed inspection request"}
            </p>
          </div>
          <StatusBadge label={formatDateTime(item.requestedAt)} variant="outline" />
        </div>

        {isTerminal ? (
          <p className="border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
            {item.localStatus === "cancelled"
              ? "This request was declined. The applicant can rebook if you publish new slots. Declined requests cannot be approved again."
              : item.localStatus === "no_show"
                ? "Recorded as a no-show after the scheduled visit."
                : "Visit marked complete."}
          </p>
        ) : null}

        <p className="text-sm leading-6 text-muted-foreground">{item.notification.body}</p>
        <Textarea
          rows={3}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Add inspection notes or seriousness context"
        />

        {isPending ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="primary" disabled={pendingAction} onClick={onApprove}>
              Approve visit
            </Button>
            <InspectionMoreMenu
              disabled={pendingAction}
              menuLabel="Decline only if you cannot host this visit. This cannot be undone."
              items={[
                {
                  id: "decline",
                  label: "Decline request",
                  description: item.inspectionId
                    ? "Frees the slot on Haven and notifies the applicant."
                    : "Frees the slot when Haven id is present on the notification.",
                  destructive: true,
                  onSelect: onDecline,
                },
              ]}
            />
          </div>
        ) : null}

        {isApproved ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="primary" disabled={pendingAction} onClick={onMarkCompleted}>
              Mark completed
            </Button>
            <InspectionMoreMenu
              disabled={pendingAction}
              menuLabel="Use after the scheduled time if they did not attend."
              items={[
                {
                  id: "no-show",
                  label: "Mark no-show",
                  description: "For approved visits when the applicant did not show up.",
                  destructive: true,
                  onSelect: onMarkNoShow,
                },
              ]}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
