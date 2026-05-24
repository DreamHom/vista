"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface InspectionMoreMenuItem {
  id: string;
  label: string;
  description: string;
  destructive?: boolean;
  onSelect: () => void;
}

/**
 * Secondary / destructive inspection actions behind ⋯ (not beside primary CTA).
 * Square panel per DESIGN.md; destructive color only inside the menu.
 */
export function InspectionMoreMenu({
  disabled,
  menuLabel,
  items,
  triggerLabel = "More inspection actions",
}: {
  disabled?: boolean;
  menuLabel: string;
  items: InspectionMoreMenuItem[];
  triggerLabel?: string;
}) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          aria-label={triggerLabel}
          className="shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[15rem] rounded-none border-border p-1 shadow-none">
        <DropdownMenuLabel className="max-w-[15rem] whitespace-normal px-2 py-2 text-xs font-normal leading-relaxed text-muted-foreground">
          {menuLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((entry) => (
          <DropdownMenuItem
            key={entry.id}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-0.5 rounded-none px-2 py-2",
              entry.destructive &&
                "text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
            )}
            onSelect={() => entry.onSelect()}
          >
            <span className="text-sm font-medium">{entry.label}</span>
            <span
              className={cn(
                "text-xs leading-snug",
                entry.destructive ? "text-destructive/80" : "text-muted-foreground",
              )}
            >
              {entry.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
