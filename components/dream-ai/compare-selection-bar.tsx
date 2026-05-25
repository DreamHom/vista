"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { COMPARE_SELECTION_MAX, useCompareSelection } from "./compare-selection-store";

export function CompareSelectionBar() {
  const router = useRouter();
  const { selectedIds, clear } = useCompareSelection();
  const count = selectedIds.length;

  if (count === 0) return null;

  const label =
    count < 2
      ? "Pick one more to compare"
      : `Compare selected (${count})`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 backdrop-blur-sm">
      <div className="container flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {count} of {COMPARE_SELECTION_MAX} listings selected
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => clear()}>
            Clear
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={count < 2}
            onClick={() => {
              if (count < 2) return;
              const ids = selectedIds.join(",");
              clear();
              router.push(`/dream-ai?compare=${encodeURIComponent(ids)}`);
            }}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
