import { ApiError } from "@/lib/api";
import {
  findOverlappingInspectionSlot,
  inspectionTimeRangesOverlap,
  type InspectionSlotInput,
} from "@/lib/inspection-slots";
import { inspectionSlotCreateErrorMessage } from "@/lib/inspection-slot-errors";
import { createInspectionSlot } from "@/lib/owner-dashboard";

export const SLOT_DURATION_PRESETS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
] as const;

export const START_TIME_PRESETS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] as const;

export type SlotWindowLocal = { startsAt: string; endsAt: string };

export function addMinutesToTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function buildSlotWindow(slotDate: string, startTime: string, endTime: string): SlotWindowLocal {
  return {
    startsAt: `${slotDate}T${startTime}`,
    endsAt: `${slotDate}T${endTime}`,
  };
}

export function buildBatchWindows(
  slotDate: string,
  startTimes: string[],
  durationMinutes: number,
): SlotWindowLocal[] {
  return [...startTimes]
    .sort()
    .map((startTime) => buildSlotWindow(slotDate, startTime, addMinutesToTime(startTime, durationMinutes)));
}

export function findOverlapWithinBatch(windows: SlotWindowLocal[]): { a: SlotWindowLocal; b: SlotWindowLocal } | null {
  for (let i = 0; i < windows.length; i += 1) {
    for (let j = i + 1; j < windows.length; j += 1) {
      const a = windows[i]!;
      const b = windows[j]!;
      if (inspectionTimeRangesOverlap(a.startsAt, a.endsAt, b.startsAt, b.endsAt)) {
        return { a, b };
      }
    }
  }
  return null;
}

export function findExistingOverlap(
  existing: InspectionSlotInput[],
  windows: SlotWindowLocal[],
): InspectionSlotInput | undefined {
  for (const window of windows) {
    const hit = findOverlappingInspectionSlot(existing, window);
    if (hit) return hit;
  }
  return undefined;
}

export interface PublishSlotsResult {
  created: number;
  failed: Array<{ window: SlotWindowLocal; message: string }>;
}

/** Sequential creates so Postgres overlap errors surface per window without aborting the whole batch. */
export async function publishInspectionSlots(
  listingId: number,
  windows: SlotWindowLocal[],
): Promise<PublishSlotsResult> {
  const result: PublishSlotsResult = { created: 0, failed: [] };

  for (const window of windows) {
    try {
      await createInspectionSlot(listingId, window);
      result.created += 1;
    } catch (error) {
      result.failed.push({
        window,
        message: inspectionSlotCreateErrorMessage(error),
      });
    }
  }

  return result;
}

export function isSlotWindowInPast(window: SlotWindowLocal): boolean {
  return new Date(window.startsAt).getTime() < Date.now();
}

export function formatWindowLabel(window: SlotWindowLocal): string {
  const start = new Date(window.startsAt);
  const end = new Date(window.endsAt);
  const day = new Intl.DateTimeFormat("en-NG", { weekday: "short", month: "short", day: "numeric" }).format(start);
  const time = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time.format(start)} – ${time.format(end)}`;
}

export function isSlotOverlapApiError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
