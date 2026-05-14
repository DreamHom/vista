import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyHint({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="border border-dashed border-border bg-secondary/40 p-8 text-center">
      <p className="text-xl font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{body}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-5")}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
