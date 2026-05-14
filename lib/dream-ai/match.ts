/**
 * DreamHomes AI: mock matching engine.
 *
 * Until we wire haven's v1.0.1 public listing browse endpoint (`GET /api/listings`
 * with filters like `listingType`, `propertyType`, `location`, and `priceMax`)
 * plus an actual LLM, this file is the brain of the Dream AI page. It parses a
 * user's free-form prompt into structured filters and returns ranked matches
 * from the backend-backed public listing inventory.
 *
 * Heuristics, not ML: but the rules cover the prompts a property hunter
 * would actually type: location keywords ("Lekki", "Abuja"), bedroom counts,
 * a price ceiling in millions, term hints ("rent" vs "buy"), and listing
 * type words ("apartment", "villa"). Good enough for a demo, and the
 * call-site shape is what we'd keep when a real backend replaces it.
 */

import type { PublicListing } from "@/lib/seed/public-data";

type ListingTerm = PublicListing["term"];
type ListingType = PublicListing["type"];

export interface ParsedQuery {
  /** Lowercased free text. */
  raw: string;
  bedrooms?: number;
  /** Inclusive ceiling, in Naira. */
  maxPriceNgn?: number;
  term?: ListingTerm;
  type?: ListingType;
  /** Substrings that should appear in `location`. */
  locationHints: string[];
}

const TYPE_WORDS: Record<string, ListingType> = {
  villa: "HOUSE",
  villas: "HOUSE",
  house: "HOUSE",
  home: "HOUSE",
  detached: "HOUSE",
  semi: "HOUSE",
  apartment: "APARTMENT",
  flat: "APARTMENT",
  loft: "APARTMENT",
  penthouse: "APARTMENT",
  office: "COMMERCIAL",
  commercial: "COMMERCIAL",
  shop: "COMMERCIAL",
};

const KNOWN_LOCATIONS = [
  "lekki",
  "ikoyi",
  "victoria island",
  "vi",
  "banana island",
  "eko atlantic",
  "sangotedo",
  "ajah",
  "lakowe",
  "tarkwa",
  "ikeja",
  "abuja",
  "maitama",
  "asokoro",
  "wuse",
  "lagos",
];

export function parseQuery(input: string): ParsedQuery {
  const raw = input.toLowerCase();

  // Bedrooms: "3 bed", "3-bedroom", "three bedroom".
  let bedrooms: number | undefined;
  const bedMatch = raw.match(/(\d+)\s*[- ]?(bed|bedroom|br)/);
  if (bedMatch) bedrooms = parseInt(bedMatch[1], 10);
  else {
    const wordToNum: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    };
    for (const [word, n] of Object.entries(wordToNum)) {
      if (new RegExp(`\\b${word}\\b\\s+(bed|bedroom|br)`).test(raw)) {
        bedrooms = n;
        break;
      }
    }
  }

  // Price ceiling: "under 5m", "below ₦5 million", "max 50m".
  let maxPriceNgn: number | undefined;
  const priceMatch = raw.match(
    /(?:under|below|less than|max|up to|≤|<=?|<)\s*₦?\s*(\d+(?:\.\d+)?)\s*(m|mil|million|b|bn|billion|k|thousand)?/,
  );
  if (priceMatch) {
    const n = parseFloat(priceMatch[1]);
    const unit = priceMatch[2];
    if (!unit || unit.startsWith("m")) maxPriceNgn = n * 1_000_000;
    else if (unit.startsWith("b")) maxPriceNgn = n * 1_000_000_000;
    else if (unit.startsWith("k") || unit === "thousand") maxPriceNgn = n * 1_000;
    else maxPriceNgn = n;
  }

  // Term: explicit signals only.
  let term: ListingTerm | undefined;
  if (/\b(rent|rental|renting|lease|leasing|to let|let)\b/.test(raw)) term = "RENT";
  else if (/\b(buy|buying|sale|for sale|purchase|own|invest)\b/.test(raw)) term = "SALE";

  // Type: first match wins.
  let type: ListingType | undefined;
  for (const [word, t] of Object.entries(TYPE_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(raw)) {
      type = t;
      break;
    }
  }

  // Locations: any known substring that appears.
  const locationHints = KNOWN_LOCATIONS.filter((loc) => raw.includes(loc));

  return { raw, bedrooms, maxPriceNgn, term, type, locationHints };
}

export interface ScoredMatch {
  listing: PublicListing;
  score: number;
  /** Human-readable bullets explaining why this listing matched. */
  reasons: string[];
}

/**
 * Rank LISTINGS against a parsed query. Higher score = better fit.
 *   +3 location hint hit
 *   +2 type match
 *   +2 term match
 *   +2 exact bedroom match (+1 ±1)
 *   +1 price under ceiling
 *  −10 hard mismatch on type or term (effectively filters out)
 */
export function rankMatches(
  query: ParsedQuery,
  inventory: PublicListing[],
  limit = 3,
): ScoredMatch[] {
  const results: ScoredMatch[] = inventory.map((listing) => {
    const reasons: string[] = [];
    let score = 0;

    const loc = listing.location.toLowerCase();
    for (const hint of query.locationHints) {
      if (loc.includes(hint)) {
        score += 3;
        reasons.push(`In ${listing.location}`);
        break; // one bonus per listing, not per hint
      }
    }

    if (query.type) {
      if (listing.type === query.type) {
        score += 2;
      } else {
        score -= 10;
      }
    }

    if (query.term) {
      if (listing.term === query.term) {
        score += 2;
        reasons.push(query.term === "RENT" ? "Available to rent" : "For sale");
      } else {
        score -= 10;
      }
    }

    if (query.bedrooms !== undefined && listing.bedrooms !== null) {
      const diff = Math.abs(listing.bedrooms - query.bedrooms);
      if (diff === 0) {
        score += 2;
        reasons.push(`${listing.bedrooms}-bedroom`);
      } else if (diff === 1) {
        score += 1;
      }
    }

    if (query.maxPriceNgn !== undefined && listing.priceNgn <= query.maxPriceNgn) {
      score += 1;
      reasons.push("Within your budget");
    }

    // Verified is a tiebreaker: slight nudge.
    if (listing.verified) score += 0.5;

    return { listing, score, reasons };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Phrase the AI assistant's reply. Pure text; listing cards are rendered
 * separately by the chat UI from `matches[i].listing`.
 */
export function composeReply(query: ParsedQuery, matches: ScoredMatch[]): string {
  if (matches.length === 0) {
    return [
      "I couldn't find anything that fits all of that in the current inventory.",
      "",
      "Try loosening one constraint: drop the bedroom count, widen the location, or raise the budget. Or describe the *feel* of the place you want and I'll see what I can pull.",
    ].join("\n");
  }

  const parts: string[] = [];
  const bits: string[] = [];
  if (query.bedrooms) bits.push(`${query.bedrooms}-bedroom`);
  if (query.type) bits.push(query.type.toLowerCase());
  if (query.locationHints.length) bits.push(`in ${query.locationHints.join(" / ")}`);
  if (query.term === "RENT") bits.push("to rent");
  else if (query.term === "SALE") bits.push("for sale");

  if (bits.length) {
    parts.push(`Here's what I found ${bits.length === 1 ? "matching" : "for"} ${bits.join(" ")}:`);
  } else {
    parts.push("Here's what I'd start with from our current shortlist:");
  }
  parts.push("");

  matches.forEach((m, i) => {
    const r = m.reasons.length ? ` (${m.reasons.join(", ")})` : "";
    parts.push(`${i + 1}. **${m.listing.title}**${r}.`);
  });

  parts.push("");
  parts.push("Tap any card to open the full listing. Want me to refine further?");
  return parts.join("\n");
}
