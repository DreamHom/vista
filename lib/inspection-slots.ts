export interface InspectionSlotInput {
  id: string;
  startsAt: string;
  endsAt: string;
}

const BOOKING_GRACE_MS = 5 * 60 * 1000;

export function upcomingInspectionSlots(slots: InspectionSlotInput[]): InspectionSlotInput[] {
  const cutoff = Date.now() - BOOKING_GRACE_MS;
  return slots
    .filter((slot) => new Date(slot.startsAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function groupInspectionSlotsByDay(slots: InspectionSlotInput[]): Array<[string, InspectionSlotInput[]]> {
  const map = new Map<string, InspectionSlotInput[]>();
  for (const slot of upcomingInspectionSlots(slots)) {
    const key = slot.startsAt.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(slot);
    map.set(key, list);
  }
  return [...map.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function slotDayKey(slot: InspectionSlotInput): string {
  return slot.startsAt.slice(0, 10);
}

export function formatSlotDayLong(dayKey: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dayKey}T12:00:00`));
}

export function formatSlotDayShort(dayKey: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dayKey}T12:00:00`));
}

export function formatSlotTimeRange(slot: InspectionSlotInput): string {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  const time = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" });
  return `${time.format(start)} – ${time.format(end)}`;
}

export function formatSlotTimeStart(slot: InspectionSlotInput): string {
  return new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }).format(
    new Date(slot.startsAt),
  );
}

export function formatSlotBookingLabel(slot: InspectionSlotInput): string {
  const dayKey = slotDayKey(slot);
  return `${formatSlotDayLong(dayKey)} · ${formatSlotTimeStart(slot)}`;
}

export function slotDurationMinutes(slot: InspectionSlotInput): number {
  const ms = new Date(slot.endsAt).getTime() - new Date(slot.startsAt).getTime();
  return Math.max(0, Math.round(ms / 60_000));
}

/** True when two half-open style windows share any instant (matches Haven GIST exclude intent). */
export function inspectionTimeRangesOverlap(
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date,
): boolean {
  const a0 = new Date(aStart).getTime();
  const a1 = new Date(aEnd).getTime();
  const b0 = new Date(bStart).getTime();
  const b1 = new Date(bEnd).getTime();
  if (![a0, a1, b0, b1].every(Number.isFinite)) return false;
  return a0 < b1 && b0 < a1;
}

export function findOverlappingInspectionSlot(
  existing: InspectionSlotInput[],
  candidate: Pick<InspectionSlotInput, "startsAt" | "endsAt">,
): InspectionSlotInput | undefined {
  return existing.find((slot) =>
    inspectionTimeRangesOverlap(slot.startsAt, slot.endsAt, candidate.startsAt, candidate.endsAt),
  );
}

export function toInspectionSlotInputs(
  rows: Array<{ id: number | string; startsAt: string; endsAt: string }>,
): InspectionSlotInput[] {
  return rows.map((row) => ({
    id: String(row.id),
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  }));
}
