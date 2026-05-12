import { havenFetch } from "./http";
import type { CreatePropertyRequest, PropertyResponse } from "./types";

export async function createProperty(
  token: string,
  body: CreatePropertyRequest,
): Promise<PropertyResponse> {
  return havenFetch<PropertyResponse>("/api/properties", {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}
