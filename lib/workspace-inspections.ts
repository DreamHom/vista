import { api } from "@/lib/api";
import type {
  InspectionResponse,
  NotificationKind,
  NotificationResponse,
  SlotResponse,
} from "@/lib/applicant-dashboard";
import { listNotifications } from "@/lib/applicant-dashboard";
import { getListingById } from "@/lib/seed/public-data";
import type { PublicListingDetail } from "@/lib/seed/public-data";

const INSPECTION_NOTIFICATION_KINDS: NotificationKind[] = [
  "INSPECTION_REQUESTED",
  "INSPECTION_BOOKED",
  "INSPECTION_APPROVED",
  "INSPECTION_DECLINED",
  "INSPECTION_CANCELLED",
];

const SERVER_STATE_KEY = "dreamhomes.workspace-inspections.server";
const NOTES_KEY = "dreamhomes.workspace-inspections.notes";

export interface WorkspaceInspectionItem {
  inspection: InspectionResponse;
  slot: SlotResponse | null;
  listing: PublicListingDetail | null;
  applicantName: string;
  requestedAt: string;
  sourceNotificationId: number | null;
}

function storageKey(prefix: string, userId: number) {
  return `${prefix}.${userId}`;
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function parseNotificationPayload(payload: NotificationResponse["payload"]) {
  if (payload == null) return null;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return payload as Record<string, unknown>;
}

export function pickInspectionIdFromPayload(payload: unknown): number | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const raw = payload as Record<string, unknown>;
  for (const key of ["inspectionRequestId", "inspectionId", "inspection_id"]) {
    const v = raw[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  }
  return null;
}

function readNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function readInspectionServerState(userId: number): Record<number, InspectionResponse> {
  return readFromStorage(storageKey(SERVER_STATE_KEY, userId), {});
}

export function saveInspectionServerState(userId: number, inspection: InspectionResponse) {
  const current = readInspectionServerState(userId);
  current[inspection.id] = inspection;
  writeToStorage(storageKey(SERVER_STATE_KEY, userId), current);
}

export function readWorkspaceInspectionNotes(userId: number): Record<number, string> {
  return readFromStorage(storageKey(NOTES_KEY, userId), {});
}

export function saveWorkspaceInspectionNote(userId: number, inspectionId: number, note: string) {
  const current = readWorkspaceInspectionNotes(userId);
  current[inspectionId] = note;
  writeToStorage(storageKey(NOTES_KEY, userId), current);
}

function statusFromNotificationKind(kind: NotificationKind): InspectionResponse["status"] | null {
  if (kind === "INSPECTION_CANCELLED") return "CANCELLED";
  if (kind === "INSPECTION_DECLINED") return "DECLINED";
  if (kind === "INSPECTION_APPROVED") return "APPROVED";
  if (kind === "INSPECTION_REQUESTED" || kind === "INSPECTION_BOOKED") return "PENDING";
  return null;
}

function slotFromPayload(
  payload: Record<string, unknown> | null,
  slotId: number,
  listingId: number,
): SlotResponse | null {
  const startsAt = readString(payload?.startsAt, "");
  const endsAt = readString(payload?.endsAt, "");
  if (!startsAt || !endsAt) return null;
  return { id: slotId, listingId, startsAt, endsAt };
}

async function hydrateSlot(
  slotId: number,
  listingId: number,
  hint: SlotResponse | null,
): Promise<SlotResponse | null> {
  if (hint?.startsAt && hint.endsAt) return hint;
  try {
    const slots = await api.get<SlotResponse[]>(`/listings/${listingId}/slots`, { skipAuth: true });
    return slots.find((row) => row.id === slotId) ?? hint;
  } catch {
    return hint;
  }
}

async function loadListing(listingId: number): Promise<PublicListingDetail | null> {
  try {
    return (await getListingById(String(listingId))) ?? null;
  } catch {
    return null;
  }
}

type DraftRow = {
  inspectionId: number;
  slotId: number;
  listingId: number;
  applicantId: number;
  applicantName: string;
  requestedAt: string;
  status: InspectionResponse["status"];
  sourceNotificationId: number;
  slotHint: SlotResponse | null;
  notes: string | null;
};

export async function listWorkspaceInspections(input: {
  userId: number;
  listingIds: Set<number>;
}): Promise<WorkspaceInspectionItem[]> {
  const { userId, listingIds } = input;
  const { items: notifications } = await listNotifications({ size: 100 });
  const serverState = readInspectionServerState(userId);
  const draftMap = new Map<number, DraftRow>();

  for (const notification of notifications) {
    if (!INSPECTION_NOTIFICATION_KINDS.includes(notification.kind)) continue;
    const payload = parseNotificationPayload(notification.payload);
    const inspectionId = pickInspectionIdFromPayload(payload);
    const listingId = readNumeric(payload?.listingId);
    const slotId = readNumeric(payload?.slotId);
    const applicantId = readNumeric(payload?.applicantId);

    if (inspectionId == null || listingId == null || slotId == null) continue;
    if (listingIds.size > 0 && !listingIds.has(listingId)) continue;

    const kindStatus = statusFromNotificationKind(notification.kind);
    const cached = serverState[inspectionId];
    let status = cached?.status ?? kindStatus ?? "PENDING";
    if (kindStatus === "CANCELLED" || kindStatus === "DECLINED" || kindStatus === "COMPLETED") {
      status = kindStatus;
    }

    const existing = draftMap.get(inspectionId);
    const requestedAt = notification.createdAt;
    if (
      existing &&
      new Date(existing.requestedAt).getTime() >= new Date(requestedAt).getTime()
    ) {
      continue;
    }

    draftMap.set(inspectionId, {
      inspectionId,
      slotId,
      listingId,
      applicantId: applicantId ?? 0,
      applicantName: applicantId ? `Applicant #${applicantId}` : "Interested applicant",
      requestedAt,
      status: cached?.status ?? status,
      sourceNotificationId: notification.id,
      slotHint: slotFromPayload(payload, slotId, listingId),
      notes: cached?.notes ?? null,
    });
  }

  for (const [id, cached] of Object.entries(serverState)) {
    const inspectionId = Number(id);
    if (!draftMap.has(inspectionId)) {
      draftMap.set(inspectionId, {
        inspectionId,
        slotId: cached.slotId,
        listingId: 0,
        applicantId: cached.applicantId,
        applicantName: `Applicant #${cached.applicantId}`,
        requestedAt: cached.updatedAt,
        status: cached.status,
        sourceNotificationId: 0,
        slotHint: null,
        notes: cached.notes ?? null,
      });
    } else {
      const row = draftMap.get(inspectionId)!;
      row.status = cached.status;
      row.notes = cached.notes ?? row.notes;
      row.slotId = cached.slotId;
    }
  }

  const drafts = [...draftMap.values()].filter((row) => row.listingId > 0 || row.slotHint);

  const listingCache = new Map<number, PublicListingDetail | null>();
  const enriched = await Promise.all(
    drafts.map(async (draft) => {
      let listingId = draft.listingId;
      if (!listingId && draft.slotHint) listingId = draft.slotHint.listingId;
      if (!listingId) return null;

      const slot = await hydrateSlot(draft.slotId, listingId, draft.slotHint);
      if (!listingCache.has(listingId)) {
        listingCache.set(listingId, await loadListing(listingId));
      }

      const inspection: InspectionResponse = {
        id: draft.inspectionId,
        slotId: draft.slotId,
        applicantId: draft.applicantId,
        status: draft.status,
        notes: draft.notes,
        createdAt: draft.requestedAt,
        updatedAt: draft.requestedAt,
      };

      return {
        inspection,
        slot,
        listing: listingCache.get(listingId) ?? null,
        applicantName: draft.applicantName,
        requestedAt: draft.requestedAt,
        sourceNotificationId: draft.sourceNotificationId || null,
      } satisfies WorkspaceInspectionItem;
    }),
  );

  return enriched
    .filter((row): row is WorkspaceInspectionItem => row != null)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

export function workspaceInspectionTab(
  item: WorkspaceInspectionItem,
): "pending" | "approved" | "completed" | "cancelled" {
  const status = item.inspection.status;
  if (status === "PENDING") return "pending";
  if (status === "APPROVED") return "approved";
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED" || status === "DECLINED" || status === "NO_SHOW") return "cancelled";
  return "cancelled";
}
