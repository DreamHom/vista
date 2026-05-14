"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { NumberedStep } from "./numbered-step";

const NUMBERS = ["01", "02", "03", "04"] as const;

/**
 * Section 03: Four-step value proposition.
 *
 * A proper bordered 2×2 grid. The grid sits inside `px-5` so it has a
 * consistent ~20px margin from the section edges at every viewport (no
 * `container` here: we don't want the grid centring narrow with hundreds
 * of pixels of margin on wide screens).
 *
 *   ┌──────────┬──────────┐
 *   │ 01 Browse │ 03 Visit │
 *   ├──────────┼──────────┤
 *   │ 02 Connect│ 04 Close │
 *   └──────────┴──────────┘
 *
 * Reading order is COLUMN-FIRST (01-02 left column, 03-04 right column);
 * DOM order matches; `grid-flow-col` positions the cells.
 */
export function ValueProposition() {
  const { t } = useTranslations();
  const [s1, s2, s3, s4] = t.valueProp.steps;

  return (
    <section className="container pt-10 pb-20 md:pt-14 md:pb-28">
      <div className="mx-2 grid grid-cols-1 border border-border sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-2">
        {/* 01: top-left */}
        <div className="border-b border-border px-6 py-10 sm:border-r sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <NumberedStep number={NUMBERS[0]} title={s1.title} body={s1.body} />
        </div>
        {/* 02: bottom-left */}
        <div className="border-b border-border px-6 py-10 sm:border-b-0 sm:border-r sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <NumberedStep number={NUMBERS[1]} title={s2.title} body={s2.body} />
        </div>
        {/* 03: top-right */}
        <div className="border-b border-border px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <NumberedStep number={NUMBERS[2]} title={s3.title} body={s3.body} />
        </div>
        {/* 04: bottom-right (no borders, the outer container closes the grid) */}
        <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <NumberedStep number={NUMBERS[3]} title={s4.title} body={s4.body} />
        </div>
      </div>
    </section>
  );
}
