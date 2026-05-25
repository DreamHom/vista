"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const MAX_COMPARE = 5;

type CompareSelectionContextValue = {
  selectedIds: number[];
  toggle: (listingId: number) => void;
  clear: () => void;
  isSelected: (listingId: number) => boolean;
  atCap: boolean;
};

const CompareSelectionContext = createContext<CompareSelectionContextValue | null>(null);

export function CompareSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggle = useCallback((listingId: number) => {
    setSelectedIds((current) => {
      if (current.includes(listingId)) {
        return current.filter((id) => id !== listingId);
      }
      if (current.length >= MAX_COMPARE) return current;
      return [...current, listingId];
    });
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const value = useMemo(
    () => ({
      selectedIds,
      toggle,
      clear,
      isSelected: (listingId: number) => selectedIds.includes(listingId),
      atCap: selectedIds.length >= MAX_COMPARE,
    }),
    [selectedIds, toggle, clear],
  );

  return <CompareSelectionContext.Provider value={value}>{children}</CompareSelectionContext.Provider>;
}

export function useCompareSelection() {
  const ctx = useContext(CompareSelectionContext);
  if (!ctx) {
    throw new Error("useCompareSelection must be used within CompareSelectionProvider");
  }
  return ctx;
}

export function useCompareSelectionOptional() {
  return useContext(CompareSelectionContext);
}

export const COMPARE_SELECTION_MAX = MAX_COMPARE;
