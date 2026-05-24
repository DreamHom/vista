"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/dashboard/applicant-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listingStatusLabel,
  listingStatusVariant,
  ownerListingActionLabel,
  ownerListingStatusActions,
  type OwnerListingStatusAction,
} from "@/lib/listing-lifecycle";
import type { OwnerListingResponse } from "@/lib/owner-dashboard";
import { formatDateTime } from "@/components/dashboard/utils";

export function ListingStatusControls({
  listing,
  onAction,
  pendingAction,
  disabled,
}: {
  listing: OwnerListingResponse;
  onAction: (action: OwnerListingStatusAction) => void;
  pendingAction?: OwnerListingStatusAction | null;
  disabled?: boolean;
}) {
  const [confirmClose, setConfirmClose] = useState(false);
  const actions = ownerListingStatusActions(listing.status);

  function runAction(action: OwnerListingStatusAction) {
    if (action === "close") {
      setConfirmClose(true);
      return;
    }
    onAction(action);
  }

  return (
    <div className="space-y-3 border border-border bg-secondary/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Listing availability</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge label={listingStatusLabel(listing.status)} variant={listingStatusVariant(listing.status)} />
            <span className="text-xs text-muted-foreground">
              Last updated {formatDateTime(listing.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {listing.status === "TAKEN_DOWN" ? (
        <p className="text-sm text-muted-foreground">
          An administrator removed this listing from public browse. Contact support if you need it reviewed.
        </p>
      ) : null}

      {listing.status === "CLOSED" ? (
        <p className="text-sm text-muted-foreground">
          This offer is closed. It stays on record for trust and history. To rent or sell again, create a new listing on
          this property.
        </p>
      ) : null}

      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action}
              type="button"
              variant={action === "close" ? "outline" : "secondary"}
              disabled={disabled || pendingAction === action}
              onClick={() => runAction(action)}
            >
              {pendingAction === action ? "Updating..." : ownerListingActionLabel(action)}
            </Button>
          ))}
        </div>
      ) : null}

      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close this listing?</DialogTitle>
            <DialogDescription>
              Closing marks this offer as finished (rented or sold). You cannot reopen it. Publish a new listing on the
              same property when you are ready to list again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Keep live
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="primary"
              disabled={disabled || pendingAction === "close"}
              onClick={() => {
                setConfirmClose(false);
                onAction("close");
              }}
            >
              {pendingAction === "close" ? "Closing..." : "Close listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
