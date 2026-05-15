/** Starter prompts surfaced on the applicant dashboard Dream AI card. */
export const DREAM_AI_DASHBOARD_PROMPTS = [
  "Find me a 2 bedroom in Yaba under ₦2.5m",
  "Show safer rent options around Lekki Phase 1",
  "What should I verify before paying agency fees?",
] as const;

export function buildDreamAiHref(prompt?: string): string {
  const base = "/dream-ai";
  const trimmed = prompt?.trim();
  if (!trimmed) return base;
  return `${base}?${new URLSearchParams({ prompt: trimmed }).toString()}`;
}
