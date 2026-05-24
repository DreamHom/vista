"use client";

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
import { formatNaira } from "@/lib/format";

export function AcceptOfferDialog({
  open,
  onOpenChange,
  amount,
  listingTitle,
  applicantLabel,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  listingTitle: string;
  applicantLabel: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept this offer?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You are accepting <strong className="text-foreground">{formatNaira(amount)}</strong> from{" "}
                <strong className="text-foreground">{applicantLabel}</strong> on{" "}
                <strong className="text-foreground">{listingTitle}</strong>.
              </p>
              <p>Haven will do the following in one step:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Mark this offer as accepted (your permanent record of who rented or bought).</li>
                <li>Close the listing so it is no longer open for new offers.</li>
                <li>Decline every other pending offer on this listing and notify those applicants.</li>
              </ul>
              <p>You cannot accept a second offer on the same listing. To list again later, create a new listing on the property.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="primary" disabled={pending} onClick={onConfirm}>
            {pending ? "Accepting..." : "Accept offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
