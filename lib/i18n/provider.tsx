"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, type LocaleCode } from "../i18n";
import { DICTIONARIES, type Dictionary } from "./dictionary";

/**
 * Landing-page i18n context.
 *
 * Scope: any component below `<I18nProvider>` can read the active locale +
 * the translated dictionary via `useTranslations()` and switch via
 * `setLocale()`. The active locale persists to localStorage so a refresh
 * keeps the user's choice.
 *
 * Hydration: SSR always renders `DEFAULT_LOCALE` (en). On mount the
 * provider reads localStorage and switches if needed. That means a user
 * who had `yo` selected sees a brief flash of English on cold load; the
 * trade-off avoids hydration mismatch warnings.
 */

const STORAGE_KEY = "dreamhomes.locale";

interface I18nContextValue {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: LocaleCode;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  // Read persisted choice on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && stored in DICTIONARIES) {
        setLocaleState(stored as LocaleCode);
      }
    } catch {
      /* localStorage might be unavailable (private mode etc.): ignore. */
    }
  }, []);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* same: quietly ignore. */
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: DICTIONARIES[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Read the active locale's dictionary + the locale-switch action.
 *
 *   const { t, locale, setLocale } = useTranslations();
 *   <h1>{t.hero.headline}</h1>
 *
 * Throws when called outside `<I18nProvider>` so misplacement fails loud
 * in dev instead of silently rendering English.
 */
export function useTranslations(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslations must be used inside <I18nProvider>");
  }
  return ctx;
}
