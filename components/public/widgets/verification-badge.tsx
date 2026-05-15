import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  verified,
  label,
}: {
  verified: boolean;
  label: string;
}) {
  return (
    <Badge variant={verified ? "default" : "outline"} className={cn(verified && "gap-1.5")}>
      {verified ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> : null}
      {label}
    </Badge>
  );
}
