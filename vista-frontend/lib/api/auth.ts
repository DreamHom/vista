import { havenFetch } from "./http";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  MeProfileResponse,
  RegisterRequest,
  UpdateAgentProfileRequest,
  UpdateMeRequest,
} from "./types";

export async function login(body: LoginRequest): Promise<LoginResponse> {
  return havenFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body,
    cache: "no-store",
  });
}

/** Backend always returns 202 — anti-enumeration. */
export async function register(body: RegisterRequest): Promise<void> {
  await havenFetch<void>("/api/auth/register", {
    method: "POST",
    body,
    cache: "no-store",
  });
}

export async function logout(token: string): Promise<void> {
  await havenFetch<void>("/api/auth/logout", {
    method: "POST",
    token,
    cache: "no-store",
  });
}

export async function me(token: string): Promise<MeResponse> {
  return havenFetch<MeResponse>("/api/me", {
    token,
    cache: "no-store",
  });
}

export async function meProfile(token: string): Promise<MeProfileResponse> {
  return havenFetch<MeProfileResponse>("/api/me/profile", {
    token,
    cache: "no-store",
  });
}

export async function updateMe(
  token: string,
  body: UpdateMeRequest,
): Promise<MeProfileResponse> {
  return havenFetch<MeProfileResponse>("/api/me", {
    method: "PATCH",
    token,
    body,
    cache: "no-store",
  });
}

export async function changeMyPassword(
  token: string,
  body: ChangePasswordRequest,
): Promise<void> {
  await havenFetch<void>("/api/me/password", {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function updateMyAgentProfile(
  token: string,
  body: UpdateAgentProfileRequest,
): Promise<MeProfileResponse> {
  return havenFetch<MeProfileResponse>("/api/me/agent-profile", {
    method: "PATCH",
    token,
    body,
    cache: "no-store",
  });
}
