import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "DreamHomes maintenance status page.",
};

export default function MaintenancePage() {
  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-2xl border border-border bg-card p-6 text-center md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Maintenance</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          DreamHomes is getting better.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          We&apos;re carrying out maintenance to improve the product experience. If an expected back time is known, it will be posted here.
        </p>
        <div className="mt-6 border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Expected back time: We&apos;ll update this page as soon as the maintenance window is confirmed.
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Need help?{" "}
          <a href="mailto:hello@dreamhomes.today" className="font-medium text-accent hover:text-accent/80">
            hello@dreamhomes.today
          </a>
        </p>
      </div>
    </div>
  );
}
