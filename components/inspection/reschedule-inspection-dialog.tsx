"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
import { listListingSlots } from "@/lib/owner-dashboard";
import { formatInspectionWindow } from "@/components/dashboard/utils";
import { cn } from "@/lib/utils";

export function RescheduleInspectionDialog({
  open,
  onOpenChange,
  listingId,
  currentSlotId,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  currentSlotId: number;
  pending?: boolean;
  onSubmit: (slotId: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const slotsQuery = useQuery({
    queryKey: ["reschedule-slots", listingId],
    queryFn: () => listListingSlots(listingId),
    enabled: open && listingId > 0,
  });

  const options = (slotsQuery.data ?? []).filter((slot) => slot.id !== currentSlotId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule visit</DialogTitle>
          <DialogDescription>
            Pick another open slot on this listing. Haven moves the booking and frees the previous slot.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {slotsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading open slots…</p>
          ) : options.length ? (
            options.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelected(slot.id)}
                className={cn(
                  "w-full border px-3 py-2 text-left text-sm transition-colors",
                  selected === slot.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30",
                )}
              >
                {formatInspectionWindow(slot.startsAt, slot.endsAt)}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No other slots are published on this listing yet.</p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="primary"
            disabled={pending || selected == null}
            onClick={() => {
              if (selected != null) onSubmit(selected);
            }}
          >
            {pending ? "Rescheduling…" : "Confirm new slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
