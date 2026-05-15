"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { NumberedStep } from "./numbered-step";

const NUMBERS = ["01", "02", "03", "04"] as const;

const CELL_BORDERS = [
  "border-b border-border sm:border-r",
  "border-b border-border sm:border-b-0 sm:border-r",
  "border-b border-border",
  "",
] as const;

/**
 * Section 03: Four-step value proposition.
 *
 * Bordered 2×2 grid (design ref `03-value-proposition.png`). Column-first order:
 * 01–02 left column, 03–04 right. Each cell is a horizontal numeral + copy row.
 */
export function ValueProposition() {
  const { t } = useTranslations();
  const [s1, s2, s3, s4] = t.valueProp.steps;
  const steps = [s1, s2, s3, s4];

  return (
    <section className="container pt-10 pb-20 md:pt-14 md:pb-28">
      <div className="mx-2 grid grid-cols-1 border border-border sm:grid-cols-2 sm:grid-flow-col sm:grid-rows-2">
        {steps.map((step, i) => (
          <div
            key={NUMBERS[i]}
            className={cn(
              "px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-14",
              CELL_BORDERS[i],
            )}
          >
            <NumberedStep number={NUMBERS[i]} title={step.title} body={step.body} density="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}
