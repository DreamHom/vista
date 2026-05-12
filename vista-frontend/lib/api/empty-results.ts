import type { ListingResponse, Page } from "./types";

export const emptyListingsPage: Page<ListingResponse> = {
  content: [],
  page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
};
