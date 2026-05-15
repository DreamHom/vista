/**
 * Deterministic pastel background + text classes from a display name, so the
 * same person always gets the same avatar tint without storing a color.
 */

const PALETTE = [
  { bg: "bg-rose-100", fg: "text-rose-900" },
  { bg: "bg-pink-100", fg: "text-pink-900" },
  { bg: "bg-fuchsia-100", fg: "text-fuchsia-900" },
  { bg: "bg-violet-100", fg: "text-violet-900" },
  { bg: "bg-indigo-100", fg: "text-indigo-900" },
  { bg: "bg-sky-100", fg: "text-sky-900" },
  { bg: "bg-cyan-100", fg: "text-cyan-900" },
  { bg: "bg-teal-100", fg: "text-teal-900" },
  { bg: "bg-emerald-100", fg: "text-emerald-900" },
  { bg: "bg-lime-100", fg: "text-lime-900" },
  { bg: "bg-amber-100", fg: "text-amber-900" },
  { bg: "bg-orange-100", fg: "text-orange-900" },
] as const;

function nameSeedIndex(name: string): number {
  const key = name.trim().toLowerCase() || "user";
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash % PALETTE.length;
}

/** Tailwind class string: pastel background + readable foreground for initials. */
export function nameAvatarPastelClassName(name: string): string {
  const { bg, fg } = PALETTE[nameSeedIndex(name)]!;
  return `${bg} ${fg}`;
}
