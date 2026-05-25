/**
 * Dream AI wire shapes aligned with Haven OpenAPI v1.0.3 (`docs/haven-api-docs-1.0.3.yaml`).
 * Compare reasoning fields match the Dream AI compare integration brief.
 */

export type DreamAiTurnKind = "reply" | "clarify" | "no_results" | "compare" | "error";

export interface UserChoicePayload {
  chipId?: string | null;
  sendText?: string | null;
}

export interface DreamAiRunTurnRequest {
  prompt?: string | null;
  chatId?: number | null;
  clientMessageId?: string | null;
  userChoice?: UserChoicePayload | null;
  compareListingIds?: number[] | null;
  rankMode?: "FAST" | "SMART" | null;
}

export interface ChipOption {
  id: string;
  label: string;
  sendText: string;
}

export interface PerListingNote {
  id: number;
  headline: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface CompareReasoning {
  recommendedListingId: number | null;
  summary: string;
  perListing: PerListingNote[];
}

export type TurnBlockType = "listings" | "compare" | "chips";

export interface TurnBlock {
  type: TurnBlockType;
  options?: ChipOption[] | null;
  listingIds?: (number | null)[] | null;
  compareListingIds?: (number | null)[] | null;
  compareReasoning?: CompareReasoning | null;
}

export interface TurnMeta {
  inventoryEmpty?: boolean | null;
  queryTooStrict?: boolean | null;
  degraded?: boolean | null;
  provider?: string | null;
  traceId?: string | null;
  moderationBlocked?: boolean | null;
  retryable?: boolean | null;
  staleIdsFiltered?: boolean | null;
}

export interface AssistantTurnV1 {
  kind: DreamAiTurnKind;
  markdown?: string | null;
  blocks?: TurnBlock[] | null;
  meta?: TurnMeta | null;
}

export interface DreamAiRunTurnResponse {
  chatId: number | null;
  traceId: string;
  turn: AssistantTurnV1;
  listingIds?: number[];
}

export interface DreamAiChatSummaryResponse {
  id: number;
  preview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedModelDreamAiChatSummaryResponse {
  content: DreamAiChatSummaryResponse[];
  page: PageMetadata;
}

export interface DreamAiChatDetailResponse {
  chat: DreamAiChatSummaryResponse;
  messages: DreamAiChatMessageResponse[];
}

export interface DreamAiChatMessageResponse {
  id: number;
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
  clientMessageId?: string | null;
  schemaVersion?: number;
  userText?: string | null;
  assistantTurn?: AssistantTurnV1 | null;
  createdAt: string;
}
