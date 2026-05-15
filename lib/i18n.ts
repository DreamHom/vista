/**
 * Supported UI languages.
 *
 * The four official languages of Nigeria's primary listing markets. Codes
 * match BCP-47 (`en`, `yo`, `ig`, `ha`). Wiring to actual translations comes
 * later: for the landing page we only need the visible toggle.
 */
export const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "yo", label: "Yorùbá", short: "YO" },
  { code: "ig", label: "Igbo", short: "IG" },
  { code: "ha", label: "Hausa", short: "HA" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
