import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  listingTrustChipLabel,
  resolveListingTrustChips,
  type ListingTrustChip,
} from "@/lib/listing-trust";

function TrustChip({ chip }: { chip: ListingTrustChip }) {
  if (chip === "scam_warning") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 border-amber-600/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {listingTrustChipLabel(chip)}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1.5">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {listingTrustChipLabel(chip)}
    </Badge>
  );
}

export function ListingTrustChips({
  ownerIdentityVerifiedAt,
  documentsVerifiedAt,
  className,
}: {
  ownerIdentityVerifiedAt?: string | null;
  documentsVerifiedAt?: string | null;
  className?: string;
}) {
  const chips = resolveListingTrustChips({ ownerIdentityVerifiedAt, documentsVerifiedAt });
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <TrustChip key={chip} chip={chip} />
      ))}
    </div>
  );
}
