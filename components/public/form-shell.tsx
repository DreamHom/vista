import type { ReactNode } from "react";

export function FormShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-xl",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="container py-10 font-sans md:py-16">
      <div
        className={`relative mx-auto overflow-hidden border border-border bg-card ${maxWidth} shadow-[0_1px_0_rgba(15,23,42,0.06)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary before:content-['']`}
      >
        <div className="px-6 py-8 md:px-10 md:py-10">
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>
          </header>

          <div className="mt-10">{children}</div>

          {footer ? (
            <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
