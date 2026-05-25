export function isAfterInstant(iso: string | null | undefined, nowMs = Date.now()): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t <= nowMs;
}
