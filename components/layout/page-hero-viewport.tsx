import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeroViewportProps = {
  children: React.ReactNode;
  className?: string;
  /** Optional full-bleed background (gradients, washes) behind hero content. */
  backdrop?: ReactNode;
  /** Extra bottom spacing before the rest of the page (e.g. scroll affordance). */
  footerSlot?: ReactNode;
};

/**
 * Full-viewport hero shell: at least one dynamic viewport tall, grows with content.
 * Reuse on marketing pages where the first screen should breathe before dense sections.
 */
export function PageHeroViewport({ children, className, backdrop, footerSlot }: PageHeroViewportProps) {
  return (
    <section className={cn("relative flex min-h-svh flex-col", className)}>
      {backdrop ? <div className="pointer-events-none absolute inset-0 overflow-hidden">{backdrop}</div> : null}
      <div className="relative z-[1] flex flex-1 flex-col">{children}</div>
      {footerSlot}
    </section>
  );
}
