/* eslint-disable @next/next/no-img-element */
import { nameAvatarPastelClassName } from "@/lib/name-avatar-seed";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "DH";
}

export function PersonAvatar({
  name,
  photoUrl,
  size = 56,
  className,
}: {
  name: string;
  /** Optional public profile image URL from the API. */
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const src = photoUrl?.trim();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("rounded-full object-cover", className)}
        style={{ height: size, width: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        nameAvatarPastelClassName(name),
        className,
      )}
      style={{ height: size, width: size }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
