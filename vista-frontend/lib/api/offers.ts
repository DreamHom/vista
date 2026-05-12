import { havenFetch } from "./http";
import type {
  CounterOfferRequest,
  OfferResponse,
  RespondToOfferRequest,
  SubmitOfferRequest,
} from "./types";

export async function submitOffer(
  token: string,
  body: SubmitOfferRequest,
): Promise<OfferResponse> {
  return havenFetch<OfferResponse>("/api/offers", {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}

export async function respondToOffer(
  token: string,
  id: string,
  body: RespondToOfferRequest,
): Promise<OfferResponse> {
  return havenFetch<OfferResponse>(`/api/offers/${id}`, {
    method: "PATCH",
    token,
    body,
    cache: "no-store",
  });
}

export async function counterOffer(
  token: string,
  id: string,
  body: CounterOfferRequest,
): Promise<OfferResponse> {
  return havenFetch<OfferResponse>(`/api/offers/${id}/counter`, {
    method: "POST",
    token,
    body,
    cache: "no-store",
  });
}
