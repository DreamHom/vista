import { api } from "@/lib/api";
import type { MeResponse, Role } from "@/lib/types";

/** Snapshot for `setUser` after GET `/me` plus optional GET `/me/profile` (avatar). */
export type SessionUserSnapshot = {
  id: number;
  email?: string;
  fullName: string;
  role: Role;
  profileImageUrl: string | null;
};

/**
 * Loads the current user from Haven and enriches with `profileImageUrl` when `/me/profile` succeeds.
 * Call only when a valid auth token is already attached to the API client.
 */
export async function loadSessionUserWithAvatar(): Promise<SessionUserSnapshot> {
  const me = await api.get<MeResponse>("/me");
  let profileImageUrl: string | null = null;
  try {
    const profile = await api.get<{ profileImageUrl?: string | null }>("/me/profile");
    profileImageUrl = profile.profileImageUrl?.trim() || null;
  } catch {
    /* profile is optional for header avatar */
  }
  return {
    id: me.userId,
    email: me.email,
    fullName: me.fullName,
    role: me.role,
    profileImageUrl,
  };
}
