import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  bleed,
}: {
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section className={cn("w-full", className)}>
      <div className={cn(!bleed && "max-w-7xl mx-auto px-6 lg:px-8")}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-fg">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-fg-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
