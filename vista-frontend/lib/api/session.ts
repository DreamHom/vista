/**
 * Reads the JWT from the httpOnly cookie inside Server Components / Server
 * Actions / Route Handlers. Returns undefined when the user is anonymous.
 */

import { cookies } from "next/headers";

export const AUTH_COOKIE = process.env.HAVEN_AUTH_COOKIE ?? "dh_session";

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value;
}

/** Convenience: throws if the cookie isn't present. */
export async function requireToken(): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Unauthorized — JWT cookie missing.");
  }
  return token;
}
