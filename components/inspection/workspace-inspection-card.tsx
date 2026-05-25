"use client";

import { useState } from "react";

import { CancelInspectionDialog } from "@/components/inspection/cancel-inspection-dialog";
import { InspectionActionDialog } from "@/components/inspection/inspection-action-dialog";
import { InspectionMoreMenu } from "@/components/inspection/inspection-more-menu";
import { RescheduleInspectionDialog } from "@/components/inspection/reschedule-inspection-dialog";
import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { formatInspectionWindow } from "@/components/dashboard/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  inspectionHavenStatusLabel,
  inspectionHavenStatusVariant,
  inspectionOwnerDeclineErrorMessage,
  inspectionOwnerNoShowErrorMessage,
  inspectionCancelErrorMessage,
} from "@/lib/inspection-lifecycle";
import {
  agentCompleteInspection,
  agentRescheduleInspection,
  cancelInspectionWithReason,
  markInspectionNoShow,
} from "@/lib/inspection-api";
import {
  buildApprovedInspectionMenuItems,
  type WorkspaceInspectionRole,
} from "@/lib/inspection-workspace-menu";
import type { WorkspaceInspectionItem } from "@/lib/workspace-inspections";
import {
  ownerApproveInspectionRequest,
  ownerDeclineInspectionRequest,
} from "@/lib/owner-dashboard";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";

interface WorkspaceInspectionCardProps {
  item: WorkspaceInspectionItem;
  role: WorkspaceInspectionRole;
  note?: string;
  onNoteChange?: (value: string) => void;
  pending?: boolean;
  onRefresh: () => void;
  onPersistInspection: (inspection: WorkspaceInspectionItem["inspection"]) => void;
}

export function WorkspaceInspectionCard({
  item,
  role,
  note = "",
  onNoteChange,
  pending = false,
  onRefresh,
  onPersistInspection,
}: WorkspaceInspectionCardProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"complete" | "no_show" | "decline" | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const status = item.inspection.status;
  const listingId = item.slot?.listingId ?? Number(item.listing?.id ?? 0);
  const isPending = status === "PENDING";

  async function runAction(fn: () => Promise<WorkspaceInspectionItem["inspection"]>) {
    setActionPending(true);
    try {
      const updated = await fn();
      onPersistInspection(updated);
      onRefresh();
      return updated;
    } catch (error) {
      throw error;
    } finally {
      setActionPending(false);
    }
  }

  const menuItems = buildApprovedInspectionMenuItems({
    role,
    status,
    slot: item.slot,
    onCancel: () => setCancelOpen(true),
    onReschedule: () => setRescheduleOpen(true),
    onComplete: () => setConfirmAction("complete"),
    onNoShow: () => setConfirmAction("no_show"),
  });

  const moreForPending =
    isPending && role === "owner"
      ? [
          {
            id: "decline",
            label: "Decline request",
            description: "Frees the slot on Haven and notifies the applicant.",
            destructive: true,
            onSelect: () => setConfirmAction("decline"),
          },
        ]
      : [];

  return (
    <article className="border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-lg font-semibold text-foreground">{item.applicantName}</p>
          <p className="text-sm text-muted-foreground">
            {item.listing?.title ?? `Listing #${listingId}`}
            {item.listing?.address ? ` · ${item.listing.address}` : ""}
          </p>
          {item.slot ? (
            <p className="text-sm font-medium text-foreground">
              {formatInspectionWindow(item.slot.startsAt, item.slot.endsAt)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Slot times loading from Haven.</p>
          )}
        </div>
        <StatusBadge
          label={inspectionHavenStatusLabel(status)}
          variant={inspectionHavenStatusVariant(status)}
        />
      </div>

      {onNoteChange ? (
        <Textarea
          className="mt-4"
          rows={2}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Private notes for your team (not sent to Haven)"
        />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isPending && role === "owner" ? (
          <Button
            type="button"
            variant="primary"
            disabled={pending || actionPending}
            onClick={() => {
              void runAction(async () => {
                const updated = await ownerApproveInspectionRequest(item.inspection.id);
                toast.success("Visit approved on Haven.");
                return updated;
              }).catch((error) => {
                toast.error(error instanceof Error ? error.message : "Could not approve on Haven.");
              });
            }}
          >
            Approve visit
          </Button>
        ) : null}

        {(menuItems.length > 0 || moreForPending.length > 0) && (status === "APPROVED" || isPending) ? (
          <InspectionMoreMenu
            disabled={pending || actionPending}
            menuLabel="Inspection actions"
            items={[...moreForPending, ...menuItems]}
          />
        ) : null}
      </div>

      <CancelInspectionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        windowLabel={
          item.slot
            ? formatInspectionWindow(item.slot.startsAt, item.slot.endsAt)
            : item.listing?.title ?? "this visit"
        }
        pending={actionPending}
        onSubmit={(reason) => {
          void runAction(() => cancelInspectionWithReason(item.inspection.id, reason))
            .then(() => {
              toast.success("Inspection cancelled. The other party has been notified.");
              setCancelOpen(false);
            })
            .catch((error) => toast.error(inspectionCancelErrorMessage(error)));
        }}
      />

      {listingId > 0 ? (
        <RescheduleInspectionDialog
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          listingId={listingId}
          currentSlotId={item.inspection.slotId}
          pending={actionPending}
          onSubmit={(slotId) => {
            void runAction(() => agentRescheduleInspection(item.inspection.id, slotId))
              .then(() => {
                toast.success("Visit rescheduled on Haven.");
                setRescheduleOpen(false);
              })
              .catch((error) => {
                const message =
                  error instanceof ApiError && error.status === 409
                    ? "That slot was just taken. Pick another."
                    : "Could not reschedule on Haven.";
                toast.error(message);
              });
          }}
        />
      ) : null}

      <InspectionActionDialog
        open={confirmAction === "complete"}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Mark visit completed?"
        description="This closes the booking on Haven. Use after the scheduled window has ended."
        confirmLabel="Mark completed"
        pending={actionPending}
        onConfirm={() => {
          void runAction(() => agentCompleteInspection(item.inspection.id))
            .then(() => {
              toast.success("Marked completed on Haven.");
              setConfirmAction(null);
            })
            .catch((error) => toast.error(error instanceof Error ? error.message : "Could not complete on Haven."));
        }}
      />

      <InspectionActionDialog
        open={confirmAction === "no_show"}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Mark as no-show?"
        description="Record that the applicant did not attend. Only use after the slot start time."
        confirmLabel="Mark no-show"
        destructive
        pending={actionPending}
        onConfirm={() => {
          void runAction(() => markInspectionNoShow(item.inspection.id))
            .then(() => {
              toast.success("No-show recorded on Haven.");
              setConfirmAction(null);
            })
            .catch((error) => toast.error(inspectionOwnerNoShowErrorMessage(error)));
        }}
      />

      <InspectionActionDialog
        open={confirmAction === "decline"}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Decline this request?"
        description="The applicant is notified and the slot is freed for others."
        confirmLabel="Decline request"
        destructive
        pending={actionPending}
        onConfirm={() => {
          void runAction(() => ownerDeclineInspectionRequest(item.inspection.id))
            .then(() => {
              toast.success("Request declined on Haven.");
              setConfirmAction(null);
            })
            .catch((error) => toast.error(inspectionOwnerDeclineErrorMessage(error)));
        }}
      />
    </article>
  );
}
