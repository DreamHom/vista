"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  formatSlotDayLong,
  formatSlotDayShort,
  formatSlotTimeRange,
  groupInspectionSlotsByDay,
  type InspectionSlotInput,
} from "@/lib/inspection-slots";
import { cn } from "@/lib/utils";

interface InspectionSlotBookingCalendarProps {
  slots: InspectionSlotInput[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  /** When false, day/time tiles are visible but not selectable (guest preview). */
  interactive?: boolean;
  className?: string;
}

export function InspectionSlotBookingCalendar({
  slots,
  selectedSlotId,
  onSelectSlot,
  interactive = true,
  className,
}: InspectionSlotBookingCalendarProps) {
  const grouped = useMemo(() => groupInspectionSlotsByDay(slots), [slots]);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  useEffect(() => {
    if (grouped.length === 0) {
      setSelectedDayKey(null);
      return;
    }
    const stillValid = selectedDayKey && grouped.some(([day]) => day === selectedDayKey);
    if (!stillValid) {
      setSelectedDayKey(grouped[0]![0]);
    }
  }, [grouped, selectedDayKey]);

  const dayIndex = selectedDayKey ? grouped.findIndex(([day]) => day === selectedDayKey) : -1;
  const slotsForDay = dayIndex >= 0 ? grouped[dayIndex]![1] : [];

  useEffect(() => {
    if (!selectedSlotId || !selectedDayKey) return;
    const onDay = slotsForDay.some((slot) => slot.id === selectedSlotId);
    if (!onDay) onSelectSlot(null);
  }, [selectedDayKey, selectedSlotId, slotsForDay, onSelectSlot]);

  function selectDay(dayKey: string) {
    setSelectedDayKey(dayKey);
    onSelectSlot(null);
  }

  function goDay(delta: number) {
    if (dayIndex < 0) return;
    const next = grouped[dayIndex + delta];
    if (next) selectDay(next[0]);
  }

  if (grouped.length === 0) {
    return null;
  }

  return (
    <div className={cn("border border-border bg-background", className)}>
      <div className="grid md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
        <div className="border-b border-border p-3 md:border-b-0 md:border-r">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-eyebrow text-muted-foreground">
            Pick a day
          </p>
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-card disabled:opacity-40"
              disabled={!interactive || dayIndex <= 0}
              onClick={() => goDay(-1)}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <p className="min-w-0 flex-1 text-center text-sm font-medium text-foreground">
              {selectedDayKey ? formatSlotDayShort(selectedDayKey) : "—"}
            </p>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-card disabled:opacity-40"
              disabled={!interactive || dayIndex < 0 || dayIndex >= grouped.length - 1}
              onClick={() => goDay(1)}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <ul className="mt-1 hidden max-h-72 flex-col gap-1 overflow-y-auto md:flex">
            {grouped.map(([dayKey, daySlots]) => {
              const active = dayKey === selectedDayKey;
              return (
                <li key={dayKey}>
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => selectDay(dayKey)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-transparent bg-secondary/40 text-foreground hover:border-border hover:bg-secondary",
                      !interactive && "cursor-default opacity-90",
                    )}
                  >
                    <span className="text-sm font-semibold leading-tight">{formatSlotDayShort(dayKey)}</span>
                    <span className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {daySlots.length} time{daySlots.length === 1 ? "" : "s"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1 md:hidden">
            {grouped.map(([dayKey, daySlots]) => {
              const active = dayKey === selectedDayKey;
              return (
                <button
                  key={dayKey}
                  type="button"
                  disabled={!interactive}
                  onClick={() => selectDay(dayKey)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 border px-3 py-2 text-left transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary/30 text-foreground",
                  )}
                >
                  <span className="block text-xs font-semibold">{formatSlotDayShort(dayKey)}</span>
                  <span className={cn("text-[10px]", active ? "opacity-80" : "text-muted-foreground")}>
                    {daySlots.length} open
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-5">
          <p className="text-[11px] font-medium uppercase tracking-eyebrow text-muted-foreground">Pick a time</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {selectedDayKey ? formatSlotDayLong(selectedDayKey) : "Select a day"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {interactive
              ? "Choose one window. The owner confirms after you request."
              : "Sign in as an applicant to book one of these windows."}
          </p>

          <ul className="mt-4 flex flex-col gap-2" role="listbox" aria-label="Available times">
            {slotsForDay.map((slot) => {
              const active = selectedSlotId === slot.id;
              return (
                <li key={slot.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => onSelectSlot(active ? null : slot.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/50",
                      !interactive && "cursor-default hover:bg-card",
                    )}
                  >
                    <span className="text-base font-semibold tabular-nums">{formatSlotTimeRange(slot)}</span>
                    {active ? (
                      <span className="text-xs font-medium uppercase tracking-eyebrow">Selected</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Select</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
