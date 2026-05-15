/**
 * Read a display string from haven payloads that may nest objects, use
 * snake_case, or duplicate legal `fullName` into `displayName`.
 */

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const WRAPPER_KEYS = [
  "data",
  "user",
  "account",
  "profile",
  "me",
  "userEntity",
  "payload",
] as const;

/**
 * Shallow-merge wrapper objects into the top-level map so **inner keys win**
 * on collisions. The previous `{ ...inner, ...raw }` order let the envelope
 * overwrite `user.displayName`, which broke nested `/api/me` shapes.
 */
export function flattenUserLikeRecord(raw: unknown): Record<string, unknown> {
  if (!isPlainObject(raw)) return {};
  let out: Record<string, unknown> = { ...raw };
  for (const k of WRAPPER_KEYS) {
    const inner = raw[k];
    if (isPlainObject(inner)) out = { ...out, ...inner };
  }
  return out;
}

/** Highest priority first — scan the whole record per pattern. */
const DISPLAY_FIELD_RES: readonly RegExp[] = [
  /^display_?name$/i,
  /^public_?display_?name$/i,
  /^preferred_?name$/i,
  /^nickname$/i,
  /^nick_?name$/i,
  /^preferred_?user_?name$/i,
  /^screen_?name$/i,
  /^handle$/i,
  /^alias$/i,
];

const FULL_KEY = /^(full_?name)$/i;
const FIRST_NAME_FIELD_RES: readonly RegExp[] = [
  /^given_?name$/i,
  /^first_?name$/i,
  /^forename$/i,
  /^first$/i,
];
const LAST_NAME_FIELD_RES: readonly RegExp[] = [
  /^last_?name$/i,
  /^family_?name$/i,
  /^surname$/i,
  /^last$/i,
];

function asTrimmedString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return "";
}

/** Display-like keys only (no `fullName`, no automatic given-name). */
export function pickExplicitDisplayFromRecord(rec: Record<string, unknown>): string {
  for (const re of DISPLAY_FIELD_RES) {
    for (const [k, v] of Object.entries(rec)) {
      if (!re.test(k)) continue;
      const s = asTrimmedString(v);
      if (s) return s;
    }
  }
  const full = pickFullNameFromRecord(rec);
  for (const [k, v] of Object.entries(rec)) {
    if (!/^name$/i.test(k)) continue;
    const s = asTrimmedString(v);
    if (!s) continue;
    if (!full || s.localeCompare(full, undefined, { sensitivity: "accent" }) !== 0) {
      return s;
    }
  }
  return "";
}

/** Explicit display, else structured first name fields. */
export function pickDisplayNameFromRecord(rec: Record<string, unknown>): string {
  const direct = pickExplicitDisplayFromRecord(rec);
  if (direct) return direct;
  const structured = pickStructuredFirstNameFromRecord(rec);
  if (structured) return structured;
  return inferGivenNameFromFullName(rec);
}

export function pickFullNameFromRecord(rec: Record<string, unknown>): string {
  for (const [k, v] of Object.entries(rec)) {
    if (!FULL_KEY.test(k)) continue;
    const s = asTrimmedString(v);
    if (s) return s;
  }
  return "";
}

export function pickStructuredFirstNameFromRecord(rec: Record<string, unknown>): string {
  for (const re of FIRST_NAME_FIELD_RES) {
    for (const [k, v] of Object.entries(rec)) {
      if (!re.test(k)) continue;
      const s = asTrimmedString(v);
      if (s) return s;
    }
  }
  return "";
}

export function pickStructuredLastNameFromRecord(rec: Record<string, unknown>): string {
  for (const re of LAST_NAME_FIELD_RES) {
    for (const [k, v] of Object.entries(rec)) {
      if (!re.test(k)) continue;
      const s = asTrimmedString(v);
      if (s) return s;
    }
  }
  return "";
}

/**
 * When `displayName` matches legal name, use the first token. When haven omits
 * `fullName` but sends `givenName` / `firstName`, use that if `displayName`
 * clearly starts with it (legal name copied into display).
 */
export function refineDisplayAgainstStructuredNames(display: string, rec: Record<string, unknown>): string {
  const d = display.trim();
  if (!d) return d;
  const full = pickFullNameFromRecord(rec);
  const out = full ? shortDisplayWhenMirrorsFull(d, full, rec) : d;
  const tokens = out.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return out;
  const given = pickStructuredFirstNameFromRecord(rec);
  if (given && tokens[0]!.localeCompare(given, undefined, { sensitivity: "accent" }) === 0) {
    return given;
  }
  return out;
}

/**
 * When `displayName` matches legal name, use the first token for UI that
 * expects a short handle (registration sends first name as `displayName`).
 */
export function shortDisplayWhenMirrorsFull(display: string, full: string, rec?: Record<string, unknown>): string {
  const disp = display.trim();
  const f = full.trim();
  if (!disp || !f) return disp;
  if (disp.localeCompare(f, undefined, { sensitivity: "accent" }) !== 0) return disp;
  const inferred = rec ? inferGivenNameFromFullName(rec) : "";
  if (inferred) return inferred;
  const parts = f.split(/\s+/).filter(Boolean);
  if (parts.length > 1 && parts[0]) return parts[0];
  return disp;
}

function inferGivenNameFromFullName(rec: Record<string, unknown>): string {
  const full = pickFullNameFromRecord(rec);
  if (!full) return "";

  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0] ?? "";

  const family = pickStructuredLastNameFromRecord(rec);
  if (family) {
    const first = parts[0];
    const last = parts.at(-1);
    if (first && first.localeCompare(family, undefined, { sensitivity: "accent" }) === 0) {
      return parts[1] ?? first;
    }
    if (last && last.localeCompare(family, undefined, { sensitivity: "accent" }) === 0) {
      return parts[0] ?? "";
    }
  }

  if (full.includes(",")) {
    const trailing = full.split(",").at(-1)?.trim().split(/\s+/).filter(Boolean)[0];
    if (trailing) return trailing;
  }

  return parts[0] ?? "";
}
