import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Pulse-animated placeholder for in-flight content. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
