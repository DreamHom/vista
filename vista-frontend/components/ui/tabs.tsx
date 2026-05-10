import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabItem = {
  href: string;
  label: string;
  count?: number;
};

export function PillTabs({
  items,
  active,
  className,
}: {
  items: TabItem[];
  active: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "no-scrollbar -mx-2 flex items-center gap-1 overflow-x-auto px-2",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-fg text-bg"
                : "text-fg-muted hover:text-fg hover:bg-bg-sunken",
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-semibold",
                  isActive ? "bg-bg/20 text-bg" : "bg-bg-sunken text-fg-muted",
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
