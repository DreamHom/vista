/* eslint-disable @next/next/no-img-element */

import { cn } from "@/lib/utils";

export function ListingImage({
  src,
  alt,
  fallbackSrc,
  className,
}: {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}) {
  const resolvedSrc = src || fallbackSrc;

  if (resolvedSrc) {
    return <img src={resolvedSrc} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }

  return (
    <div
      aria-label={alt}
      className={cn(
        "flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(43,124,201,0.18),transparent_35%),linear-gradient(135deg,#e5eef7_0%,#f8fafc_45%,#e2e8f0_100%)] text-center text-sm text-muted-foreground",
        className,
      )}
    />
  );
}
