import { Clock3 } from "lucide-react";

export function ResponseTimePill({ minutes }: { minutes: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border px-3 py-1 text-sm text-muted-foreground">
      <Clock3 className="h-4 w-4" aria-hidden />
      {minutes !== null ? `Median response ${minutes} min` : "Response time not public yet"}
    </span>
  );
}
