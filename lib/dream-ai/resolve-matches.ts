import type { PublicListing } from "@/lib/seed/public-data";
import { parseQuery, rankMatches, type ScoredMatch } from "@/lib/dream-ai/match";

export interface ResolveDreamAiMatchesResult {
  matches: ScoredMatch[];
  /** Reserved for future hybrid paths; always false for the local-only resolver. */
  providerUnavailable: boolean;
}

/**
 * Rank listings from public inventory using local heuristics only.
 * Signed-in live turns use Haven SSE/JSON from `dream-ai-chat.tsx` instead.
 */
export async function resolveDreamAiMatches(
  userText: string,
  listings: PublicListing[],
  limit = 3,
): Promise<ResolveDreamAiMatchesResult> {
  const parsed = parseQuery(userText);
  const ranked = rankMatches(parsed, listings, 12);
  return { matches: ranked.slice(0, limit), providerUnavailable: false };
}
