"use client";

import { BadgeCheck, CalendarDays, MessagesSquare, Search } from "lucide-react";
import { useTranslations } from "@/lib/i18n/provider";
import { NumberedStep } from "./numbered-step";

const NUMBERS = ["01", "02", "03", "04"] as const;

/** One icon per step; rendered inside the shared square frame in {@link NumberedStep}. */
const STEP_VISUALS = [
  <Search key="vp-1" aria-hidden />,
  <MessagesSquare key="vp-2" aria-hidden />,
  <CalendarDays key="vp-3" aria-hidden />,
  <BadgeCheck key="vp-4" aria-hidden />,
] as const;

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
        <div className="border-b border-border px-6 py-8 sm:border-r sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <NumberedStep number={NUMBERS[0]} title={s1.title} body={s1.body} visual={STEP_VISUALS[0]} />
        </div>
        {/* 02: bottom-left */}
        <div className="border-b border-border px-6 py-8 sm:border-b-0 sm:border-r sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <NumberedStep number={NUMBERS[1]} title={s2.title} body={s2.body} visual={STEP_VISUALS[1]} />
        </div>
        {/* 03: top-right */}
        <div className="border-b border-border px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <NumberedStep number={NUMBERS[2]} title={s3.title} body={s3.body} visual={STEP_VISUALS[2]} />
        </div>
        {/* 04: bottom-right (no borders, the outer container closes the grid) */}
        <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <NumberedStep number={NUMBERS[3]} title={s4.title} body={s4.body} visual={STEP_VISUALS[3]} />
        </div>
      </div>
    </section>
  );
}
