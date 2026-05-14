import { CheckCircle2, Eye, Flag, MessageSquare } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: "eye" | "comment" | "flag" | "check";
}) {
  const Icon =
    icon === "eye" ? Eye : icon === "comment" ? MessageSquare : icon === "flag" ? Flag : CheckCircle2;

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center bg-secondary text-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
