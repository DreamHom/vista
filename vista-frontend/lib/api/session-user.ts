import { cache } from "react";
import { redirect } from "next/navigation";
import * as Auth from "./auth";
import * as Users from "./users";
import {
  flattenUserLikeRecord,
  pickDisplayNameFromRecord,
  pickExplicitDisplayFromRecord,
  pickFullNameFromRecord,
  pickStructuredFirstNameFromRecord,
  refineDisplayAgainstStructuredNames,
} from "./display-name-from-record";
import { getToken } from "./session";
import type { MeResponse, Role } from "./types";

const ROLE_HOME: Record<Role, string> = {
  APPLICANT: "/dashboard",
  OWNER: "/owner",
  AGENT: "/agent",
  ADMIN: "/admin",
};

/**
 * Signed-in user from haven, or `null` if anonymous / expired JWT.
 * Wrapped in `cache` so layout + page share one `/api/me` round-trip per request.
 */
export const getSessionUser = cache(async (): Promise<MeResponse | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    const user = await Auth.me(token);
    return await enrichSessionUser(user);
  } catch {
    return null;
  }
});

/**
 * Use in dashboard layouts: require a session and the given role; otherwise
 * redirect to login or the correct workspace home.
 */
export async function requireSessionRole(
  expected: Role,
  loginNextPath: string,
): Promise<MeResponse> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(loginNextPath)}`);
  }
  if (user.role === expected) return user;

  redirect(ROLE_HOME[user.role] ?? "/login");
}

/** When haven sends no name fields, avoid showing a raw address in the UI. */
function labelFromEmailLocalPart(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  const segment = local.split(/[._-]/)[0] ?? local;
  if (!segment) return "there";
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

async function enrichSessionUser(user: MeResponse): Promise<MeResponse> {
  const flat = flattenUserLikeRecord(user);
  const hasName =
    !!pickExplicitDisplayFromRecord(flat) ||
    !!pickStructuredFirstNameFromRecord(flat) ||
    !!pickFullNameFromRecord(flat);
  if (hasName) return user;

  try {
    const selfProfile = await Auth.meProfile(await getTokenOrThrow());
    const selfFlat = flattenUserLikeRecord(selfProfile);
    if (
      pickExplicitDisplayFromRecord(selfFlat) ||
      pickStructuredFirstNameFromRecord(selfFlat) ||
      pickFullNameFromRecord(selfFlat)
    ) {
      return { ...selfProfile, ...user };
    }
  } catch {
    // fall through to public profile
  }

  try {
    const profile = await Users.getUserProfile(user.id);
    return {
      ...profile,
      ...user,
      displayName:
        user.displayName ??
        user.display_name ??
        profile.displayName ??
        profile.display_name ??
        undefined,
      display_name:
        user.display_name ??
        user.displayName ??
        profile.display_name ??
        profile.displayName ??
        undefined,
      fullName:
        user.fullName ??
        user.full_name ??
        profile.fullName ??
        profile.full_name ??
        undefined,
      full_name:
        user.full_name ??
        user.fullName ??
        profile.full_name ??
        profile.fullName ??
        undefined,
      identityVerifiedAt:
        user.identityVerifiedAt ?? profile.identityVerifiedAt ?? undefined,
      agentCredentialVerifiedAt:
        user.agentCredentialVerifiedAt ??
        profile.agentCredentialVerifiedAt ??
        undefined,
    };
  } catch {
    return user;
  }
}

async function getTokenOrThrow(): Promise<string> {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized");
  return token;
}

/**
 * Display-only fields from `/api/me` (nested wrappers + alternate keys).
 * Does not read `fullName` as the primary value.
 */
export function extractMeDisplayName(user: MeResponse): string {
  const flat = flattenUserLikeRecord(user);
  return pickExplicitDisplayFromRecord(flat);
}

/**
 * Shell / greetings: explicit display / handle fields, then structured
 * first name if haven omits a separate display string; refine when legal name
 * was copied into display. Otherwise email local-part hint.
 */
export function displayName(user: MeResponse): string {
  const flat = flattenUserLikeRecord(user);
  const d = pickDisplayNameFromRecord(flat);
  if (!d) return labelFromEmailLocalPart(user.email);
  return refineDisplayAgainstStructuredNames(d, flat);
}

export function firstName(user: MeResponse): string {
  const flat = flattenUserLikeRecord(user);
  const structured = pickStructuredFirstNameFromRecord(flat);
  const inferredFromFull = inferFirstNameFromFullNameAndEmail(user.email, flat);
  let name = structured || inferredFromFull || displayName(user);
  if (name.includes("@")) {
    name = labelFromEmailLocalPart(name);
  }
  return name.split(/\s+/)[0] ?? name;
}

export function meToShellUser(user: MeResponse): {
  name: string;
  subline: string;
  avatar?: string;
} {
  const name = firstName(user);
  const roleLabel =
    user.role === "APPLICANT"
      ? "Applicant"
      : user.role === "OWNER"
        ? "Owner"
        : user.role === "AGENT"
          ? "Agent"
          : "Admin";
  return {
    name,
    subline: `${roleLabel} · ${user.email}`,
  };
}

function inferFirstNameFromFullNameAndEmail(
  email: string,
  flat: Record<string, unknown>,
): string {
  const full = pickFullNameFromRecord(flat).trim();
  if (!full) return "";

  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return "";

  const emailLocal = normalizeNameToken(email.split("@")[0] ?? "");
  if (!emailLocal) return "";

  const nonMatching = parts.filter(
    (part) => normalizeNameToken(part) !== emailLocal,
  );
  if (nonMatching.length === parts.length) return "";

  return nonMatching[0] ?? "";
}

function normalizeNameToken(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}
