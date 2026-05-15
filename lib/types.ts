/**
 * Shared API types: kept in lock-step with haven (Spring Boot backend).
 *
 * When backend DTOs change, update these. Source of truth lives at:
 *   ../haven/modules/feature/<domain>/api/**
 */

/** The four actor types on the platform. Mirrors {@code com.dreamhomes.haven.user.Role}. */
export const ROLES = ["OWNER", "AGENT", "APPLICANT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/** Roles a user may self-register with. ADMIN is seeded only: never accepted via /register. */
export const PUBLIC_ROLES = ["OWNER", "AGENT", "APPLICANT"] as const satisfies readonly Role[];
export type PublicRole = (typeof PUBLIC_ROLES)[number];

/** Mirrors haven's {@code UserResponse}. */
export interface User {
  id: number;
  fullName: string;
  role: Role;
  email?: string;
  createdAt?: string;
  /** Set when `/me/profile` or profile mutations return a photo URL. */
  profileImageUrl?: string | null;
}

/** Mirrors haven's {@code RegisterRequest}. */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: PublicRole;
  licenseNumber?: string;
}

/** Mirrors haven's {@code RegisterAcceptedResponse}. */
export interface RegisterAcceptedResponse {
  status: string;
  message: string;
  nextStep: string;
}

/** Mirrors haven's {@code LoginRequest}. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors haven's {@code LoginResponse}. */
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: number;
  role: Role;
  fullName: string;
}

/** Mirrors haven's {@code MeResponse} (GET /api/me). */
export interface MeResponse {
  userId: number;
  email?: string;
  fullName: string;
  role: Role;
}

/** POST /api/auth/forgot-password — 202 Accepted. */
export interface ForgotPasswordResponse {
  accepted: boolean;
  /** Present only when Haven enables debug token return (non-prod). */
  debugResetToken?: string;
}

/** @deprecated Prefer {@link import("./dream-ai/contracts").DreamAiRunTurnResponse}. */
export interface DreamAiSuggestionResponse {
  listingIds: number[];
}

/**
 * RFC 7807 Problem Details: Spring's default response shape, also used by
 * haven's GlobalExceptionHandler. Allows arbitrary extension properties.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Extension members (e.g., field-level errors from validation). */
  [key: string]: unknown;
}
