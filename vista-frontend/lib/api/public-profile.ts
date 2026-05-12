import {
  flattenUserLikeRecord,
  pickDisplayNameFromRecord,
  pickExplicitDisplayFromRecord,
  refineDisplayAgainstStructuredNames,
} from "./display-name-from-record";
import type { PublicUserProfile } from "./types";

export function publicProfileId(p: PublicUserProfile): string {
  return String(p.id);
}

/**
 * Display-only fields on `PublicUserProfile` (nested + alternate keys).
 * Does not use `fullName` as the primary value.
 */
export function extractUserDisplayName(p: PublicUserProfile): string {
  const flat = flattenUserLikeRecord(p);
  return pickExplicitDisplayFromRecord(flat);
}

/** Heading label: same resolution as session, with a placeholder if empty. */
export function publicProfileDisplayName(p: PublicUserProfile): string {
  const flat = flattenUserLikeRecord(p);
  const d = pickDisplayNameFromRecord(flat);
  if (!d) return "User";
  return refineDisplayAgainstStructuredNames(d, flat) || "User";
}

export function publicProfileAgentVerified(p: PublicUserProfile): boolean {
  return !!p.agentCredentialVerifiedAt;
}
