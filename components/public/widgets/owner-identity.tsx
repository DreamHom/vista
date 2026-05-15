import type { PublicOwner } from "@/lib/seed/public-data";

import { PersonAvatar } from "./person-avatar";
import { VerificationBadge } from "./verification-badge";

export function OwnerIdentity({ owner }: { owner: PublicOwner }) {
  const bio = owner.publicBio?.trim();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <PersonAvatar name={owner.name} photoUrl={owner.profileImageUrl ?? undefined} />
      <div className="min-w-0 flex-1 space-y-1">
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
        {bio ? <p className="pt-2 text-sm leading-relaxed text-foreground">{bio}</p> : null}
      </div>
    </div>
  );
}
