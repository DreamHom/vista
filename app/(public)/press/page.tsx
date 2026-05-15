import type { Metadata } from "next";
import Link from "next/link";
import { Download, Mail, Newspaper } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Press",
  description: "Press and media information for DreamHomes.",
};

export default function PressPage() {
  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Press / Media</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          DreamHomes was built at Moniepoint DreamDev Bootcamp 2026.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          DreamHomes is a product vision for a calmer, more accountable Nigerian property experience built around verification, transparency, and on-platform trust.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="text-xl font-semibold tracking-tight">Story</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                DreamHomes was imagined as a premium property platform that could reduce the noise, fraud, and hidden-fee frustration common in Nigerian real estate.
              </p>
              <p>
                The product direction was developed during Moniepoint DreamDev Bootcamp 2026 with a focus on trust-first discovery, real workflow clarity, and a more modern public experience.
              </p>
            </div>
          </section>

          <section className="border border-border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight">Coverage and mentions</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Formal press coverage can be added here as DreamHomes launches and gains public mentions.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Brand assets</p>
            <div className="mt-4 flex justify-center border border-border bg-secondary/40 p-6">
              <LogoMark size="xl" />
            </div>
            <div className="mt-5 grid gap-3">
              <Link href="/logo.svg" className={buttonVariants({ variant: "outline", size: "md" })}>
                <Download className="h-4 w-4" aria-hidden />
                Download SVG logo
              </Link>
              <Link href="/logo.png" className={buttonVariants({ variant: "outline", size: "md" })}>
                <Download className="h-4 w-4" aria-hidden />
                Download PNG logo
              </Link>
            </div>
          </section>

          <section className="border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="text-xl font-semibold tracking-tight">Press contact</h2>
            </div>
            <a
              href="mailto:press@dreamhomes.today"
              className="mt-4 inline-flex text-sm font-medium text-accent hover:text-accent/80"
            >
              press@dreamhomes.today
            </a>
          </section>
        </aside>
      </section>
    </div>
  );
}
