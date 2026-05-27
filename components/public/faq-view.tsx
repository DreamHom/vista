"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import type { FaqGroup } from "@/lib/content/faq";
import { cn } from "@/lib/utils";

export function FaqView({ groups }: { groups: readonly FaqGroup[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <div className="container py-10 md:py-14">
      <section className="border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">FAQ</p>
        <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          Answers before you trust a listing or a profile.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Search questions grouped for applicants, owners, and agents.
        </p>

        <div className="mt-6 flex max-w-xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search FAQs"
              className="pl-10"
              size="lg"
            />
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-6">
        {filtered.map((group) => (
          <section key={group.id} className="border border-border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight">{group.title}</h2>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <details key={item.question} className="group border border-border px-4 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="border border-border bg-secondary/40 p-6">
          <p className="text-lg font-semibold tracking-tight text-foreground">Still have questions?</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Reach the team directly if your question is specific to a listing, a partnership, or a support issue.
          </p>
          <a href="/contact" className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-4")}>
            Contact DreamHomes
          </a>
        </div>
      </div>
    </div>
  );
}
