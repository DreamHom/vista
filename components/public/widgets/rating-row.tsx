import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingRow({
  rating,
  reviewCount,
  className,
}: {
  rating: number | null;
  reviewCount: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
      <span className="font-medium text-foreground">{rating !== null ? rating.toFixed(1) : "No rating yet"}</span>
      <span className="text-muted-foreground">({reviewCount} reviews)</span>
    </div>
  );
}
