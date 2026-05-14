import type { PublicOwner } from "@/lib/seed/public-data";

import { PersonAvatar } from "./person-avatar";
import { VerificationBadge } from "./verification-badge";

export function OwnerIdentity({ owner }: { owner: PublicOwner }) {
  return (
    <div className="flex items-center gap-4">
      <PersonAvatar name={owner.name} />
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-semibold tracking-tight">{owner.name}</p>
          {owner.verified ? <VerificationBadge verified label="Owner Verified" /> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Joined{" "}
          {owner.joinedAt
            ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(owner.joinedAt))
            : "recently"}
        </p>
      </div>
    </div>
  );
}
