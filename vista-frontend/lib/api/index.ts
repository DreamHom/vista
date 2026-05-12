/**
 * Convenience re-exports so pages can do:
 *   import { listListings, getListing } from "@/lib/api";
 *
 * Every function is server-only — they live in Server Components, Server
 * Actions, or Next.js Route Handlers.
 */

export * from "./types";
export { HavenError, HAVEN_BASE_URL } from "./http";
export { getToken, requireToken, AUTH_COOKIE } from "./session";
export {
  getSessionUser,
  requireSessionRole,
  extractMeDisplayName,
  displayName,
  firstName,
  meToShellUser,
} from "./session-user";
export {
  publicProfileId,
  extractUserDisplayName,
  publicProfileDisplayName,
  publicProfileAgentVerified,
} from "./public-profile";

export * as Auth from "./auth";
export * as Listings from "./listings";
export * as Users from "./users";
export * as Inspections from "./inspections";
export * as Offers from "./offers";
export * as Comments from "./comments";
export * as Saves from "./saves";
export * as Reviews from "./reviews";
export * as Assignments from "./agent-assignments";
export * as Notifications from "./notifications";
export * as Verification from "./verification";
export * as Admin from "./admin";
export * as Properties from "./properties";
