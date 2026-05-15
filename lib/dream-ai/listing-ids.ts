import type { AssistantTurnV1, TurnBlock } from "./contracts";

/** Pull LIVE listing ids from a turn (legacy `listingIds` + listings blocks). */
export function collectTurnListingIds(turn: AssistantTurnV1, legacy?: number[]): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const push = (id: number | null | undefined) => {
    if (id == null || Number.isNaN(id)) return;
    const n = Math.trunc(Number(id));
    if (seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };
  for (const id of legacy ?? []) push(id);
  for (const b of turn.blocks ?? []) {
    const block = b as TurnBlock;
    if (block.type === "listings") for (const id of block.listingIds ?? []) push(id ?? undefined);
    if (block.type === "compare") for (const id of block.compareListingIds ?? []) push(id ?? undefined);
  }
  return out;
}
