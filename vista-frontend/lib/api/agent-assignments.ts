import { havenFetch } from "./http";
import type {
  AgentListingResponse,
  DeclineAssignmentRequest,
  RequestAgentAssignmentRequest,
  RevokeAssignmentRequest,
} from "./types";

export async function listMyAssignments(
  token: string,
): Promise<AgentListingResponse[]> {
  return havenFetch<AgentListingResponse[]>("/api/agent-listings/mine", {
    token,
    cache: "no-store",
  });
}

export async function inviteAgent(
  token: string,
  listingId: string,
  body: RequestAgentAssignmentRequest,
): Promise<AgentListingResponse> {
  return havenFetch<AgentListingResponse>(
    `/api/listings/${listingId}/agent-assignment`,
    {
      method: "POST",
      token,
      body,
      cache: "no-store",
    },
  );
}

export async function acceptAssignment(
  token: string,
  id: string,
): Promise<AgentListingResponse> {
  return havenFetch<AgentListingResponse>(
    `/api/agent-listings/${id}/accept`,
    {
      method: "POST",
      token,
      cache: "no-store",
    },
  );
}

export async function declineAssignment(
  token: string,
  id: string,
  body: DeclineAssignmentRequest,
): Promise<AgentListingResponse> {
  return havenFetch<AgentListingResponse>(
    `/api/agent-listings/${id}/decline`,
    {
      method: "POST",
      token,
      body,
      cache: "no-store",
    },
  );
}

export async function revokeAssignment(
  token: string,
  id: string,
  body: RevokeAssignmentRequest,
): Promise<AgentListingResponse> {
  return havenFetch<AgentListingResponse>(
    `/api/agent-listings/${id}/revoke`,
    {
      method: "POST",
      token,
      body,
      cache: "no-store",
    },
  );
}
