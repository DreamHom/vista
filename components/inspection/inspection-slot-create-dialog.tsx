"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { inspectionSlotCreateErrorMessage } from "@/lib/inspection-slot-errors";
import {
  addMinutesToTime,
  buildBatchWindows,
  buildSlotWindow,
  findExistingOverlap,
  findOverlapWithinBatch,
  formatWindowLabel,
  isSlotWindowInPast,
  publishInspectionSlots,
  SLOT_DURATION_PRESETS,
  START_TIME_PRESETS,
  type SlotWindowLocal,
} from "@/lib/inspection-slot-create";
import {
  formatSlotTimeRange,
  toInspectionSlotInputs,
  type InspectionSlotInput,
} from "@/lib/inspection-slots";
import { listListingSlots } from "@/lib/owner-dashboard";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

export interface ListingOption {
  id: number;
  title: string;
}

type CreateMode = "single" | "batch";

interface InspectionSlotCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listings: ListingOption[];
  /** Called after at least one slot was created. */
  onPublished?: () => void;
  queryKeysToInvalidate?: QueryKey[];
}

export function InspectionSlotCreateDialog({
  open,
  onOpenChange,
  listings,
  onPublished,
  queryKeysToInvalidate = [],
}: InspectionSlotCreateDialogProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<CreateMode>("batch");
  const [listingId, setListingId] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [batchDurationMinutes, setBatchDurationMinutes] = useState(60);
  const [selectedBatchTimes, setSelectedBatchTimes] = useState<string[]>([]);

  const existingSlotsQuery = useQuery({
    queryKey: ["listing-slots", listingId],
    queryFn: () => listListingSlots(Number(listingId)),
    enabled: open && Boolean(listingId),
  });

  useEffect(() => {
    if (!open) {
      setListingId("");
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      setSelectedBatchTimes([]);
      setMode("batch");
    }
  }, [open]);

  const startsAtLocal = slotDate && startTime ? `${slotDate}T${startTime}` : "";
  const endsAtLocal = slotDate && endTime ? `${slotDate}T${endTime}` : "";
  const todayLocal = new Date().toLocaleDateString("en-CA");

  const existingSlotInputs = useMemo(
    () => toInspectionSlotInputs(existingSlotsQuery.data ?? []),
    [existingSlotsQuery.data],
  );

  const singleWindow = useMemo((): SlotWindowLocal | null => {
    if (!slotDate || !startTime || !endTime) return null;
    return buildSlotWindow(slotDate, startTime, endTime);
  }, [slotDate, startTime, endTime]);

  const batchWindows = useMemo(() => {
    if (!slotDate || selectedBatchTimes.length === 0) return [];
    return buildBatchWindows(slotDate, selectedBatchTimes, batchDurationMinutes);
  }, [slotDate, selectedBatchTimes, batchDurationMinutes]);

  const windowsToPublish = mode === "single" ? (singleWindow ? [singleWindow] : []) : batchWindows;

  const endBeforeStart = Boolean(startTime && endTime && endTime <= startTime);
  const singleInPast = singleWindow ? isSlotWindowInPast(singleWindow) : false;
  const batchInternalOverlap = findOverlapWithinBatch(batchWindows);
  const existingOverlap = findExistingOverlap(existingSlotInputs, windowsToPublish);

  const slotsOnSelectedDay = useMemo(() => {
    if (!slotDate) return [];
    return existingSlotInputs.filter((slot) => slot.startsAt.slice(0, 10) === slotDate);
  }, [existingSlotInputs, slotDate]);

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!listingId || windowsToPublish.length === 0) return { created: 0, failed: [] };
      return publishInspectionSlots(Number(listingId), windowsToPublish);
    },
    onSuccess: async (result) => {
      if (!result) return;
      const { created, failed } = result;

      for (const key of queryKeysToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: key });
      }
      if (listingId) {
        await queryClient.invalidateQueries({ queryKey: ["listing-slots", listingId] });
        await queryClient.invalidateQueries({ queryKey: ["listing-open-slots", listingId] });
      }

      if (created > 0) {
        onPublished?.();
        if (failed.length === 0) {
          toast.success(
            created === 1 ? "Inspection slot published." : `${created} inspection slots published.`,
          );
          onOpenChange(false);
        } else {
          toast.success(
            `${created} slot${created === 1 ? "" : "s"} published. ${failed.length} could not be added (overlap or conflict).`,
          );
          setSelectedBatchTimes([]);
          void existingSlotsQuery.refetch();
        }
      } else if (failed.length > 0) {
        toast.error(failed[0]?.message ?? "No slots were published.");
      }
    },
    onError: (error) => toast.error(inspectionSlotCreateErrorMessage(error)),
  });

  const singleInvalid = mode === "single" && (endBeforeStart || singleInPast || !singleWindow);
  const batchInvalid =
    mode === "batch" && (selectedBatchTimes.length === 0 || Boolean(batchInternalOverlap));
  const overlapInvalid = Boolean(existingOverlap);
  const incomplete = !listingId || !slotDate || (mode === "single" && (!startTime || !endTime));
  const cannotPublish = incomplete || singleInvalid || batchInvalid || overlapInvalid || publishMutation.isPending;

  function toggleBatchTime(time: string) {
    setSelectedBatchTimes((current) =>
      current.includes(time) ? current.filter((value) => value !== time) : [...current, time].sort(),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish inspection times</DialogTitle>
          <DialogDescription>
            Add bookable windows on a listing calendar. Applicants pick a day, then a time, like Calendly. Haven
            rejects overlaps in the database.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="flex gap-2 border border-border p-1">
            <button
              type="button"
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                mode === "batch" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
              onClick={() => setMode("batch")}
            >
              Several times
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                mode === "single" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
              onClick={() => setMode("single")}
            >
              One window
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Listing</Label>
            <select
              value={listingId}
              onChange={(event) => setListingId(event.target.value)}
              className="flex h-10 w-full border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a listing</option>
              {listings.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Input type="date" min={todayLocal} value={slotDate} onChange={(event) => setSlotDate(event.target.value)} />
          </div>

          {slotDate ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {mode === "batch" ? "Start times (select all that apply)" : "Quick start"}
              </Label>
              <div className="flex flex-wrap gap-2">
                {START_TIME_PRESETS.map((preset) => {
                  const active = mode === "batch" ? selectedBatchTimes.includes(preset) : startTime === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (mode === "batch") {
                          toggleBatchTime(preset);
                          return;
                        }
                        setStartTime(preset);
                        if (!endTime || endTime <= preset) {
                          setEndTime(addMinutesToTime(preset, 60));
                        }
                      }}
                      aria-pressed={active}
                      className={cn(
                        "border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-secondary",
                      )}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {mode === "batch" && slotDate ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Duration for each selected time</Label>
              <div className="flex flex-wrap gap-2">
                {SLOT_DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => setBatchDurationMinutes(preset.minutes)}
                    aria-pressed={batchDurationMinutes === preset.minutes}
                    className={cn(
                      "border px-2.5 py-1 text-xs font-medium transition-colors",
                      batchDurationMinutes === preset.minutes
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-secondary",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {mode === "single" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Starts</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    const next = event.target.value;
                    setStartTime(next);
                    if (next && (!endTime || endTime <= next)) {
                      setEndTime(addMinutesToTime(next, 60));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ends</Label>
                <Input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
              </div>
            </div>
          ) : null}

          {mode === "batch" && batchWindows.length > 0 ? (
            <div className="border border-border bg-secondary/30 p-3 text-sm">
              <p className="font-medium text-foreground">
                {batchWindows.length} window{batchWindows.length === 1 ? "" : "s"} to publish
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {batchWindows.map((window) => (
                  <li key={window.startsAt} className="tabular-nums">
                    {formatWindowLabel(window)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {listingId && slotDate && slotsOnSelectedDay.length > 0 ? (
            <ExistingDaySlots slots={slotsOnSelectedDay} />
          ) : null}

          {endBeforeStart ? (
            <p className="text-sm text-destructive">End time must be after the start time.</p>
          ) : singleInPast ? (
            <p className="text-sm text-destructive">Pick a time in the future.</p>
          ) : batchInternalOverlap ? (
            <p className="text-sm text-destructive">
              Selected times overlap each other. Remove one or shorten duration.
            </p>
          ) : existingOverlap ? (
            <p className="text-sm text-destructive">
              Overlaps an existing slot ({formatSlotTimeRange(existingOverlap)}).
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={cannotPublish}
            className="gap-2"
            onClick={() => publishMutation.mutate()}
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            {publishMutation.isPending
              ? "Publishing…"
              : mode === "batch"
                ? batchWindows.length > 0
                  ? `Publish ${batchWindows.length} slot${batchWindows.length === 1 ? "" : "s"}`
                  : "Publish slots"
                : "Publish slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExistingDaySlots({ slots }: { slots: InspectionSlotInput[] }) {
  return (
    <div className="border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Already on this day</p>
      <ul className="mt-2 space-y-1">
        {slots.map((slot) => (
          <li key={slot.id} className="tabular-nums">
            {formatSlotTimeRange(slot)}
          </li>
        ))}
      </ul>
    </div>
  );
}
