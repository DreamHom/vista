import { api } from "@/lib/api";
import type {
  DreamAiChatDetailResponse,
  DreamAiRunTurnRequest,
  DreamAiRunTurnResponse,
  PagedModelDreamAiChatSummaryResponse,
} from "./contracts";

/** Synchronous JSON turn — same orchestration as SSE `final`. */
export function postDreamAiTurn(body: DreamAiRunTurnRequest, options?: { skipAuth?: boolean }) {
  return api.post<DreamAiRunTurnResponse>("/dream-ai/suggestions", body, {
    skipAuth: options?.skipAuth,
  });
}

export function listDreamAiChats(page = 0, size = 20) {
  return api.get<PagedModelDreamAiChatSummaryResponse>("/dream-ai/chats", {
    query: { page, size },
  });
}

export function getDreamAiChat(chatId: number) {
  return api.get<DreamAiChatDetailResponse>(`/dream-ai/chats/${chatId}`);
}
