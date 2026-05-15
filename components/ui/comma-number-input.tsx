"use client";

import { useEffect, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";

const intFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function digitsOnly(s: string): number {
  const d = s.replace(/\D/g, "");
  return d ? Number.parseInt(d, 10) : 0;
}

function parseDecimalLoose(s: string): number {
  const normalized = s.replace(/,/g, "").replace(/^\./, "0.").trim();
  if (!normalized) return 0;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

type Omitted = Omit<InputProps, "type" | "value" | "onChange">;

/** Whole naira / counts — thousands separators, `inputMode="numeric"`. */
export function CommaIntegerInput({
  value,
  onChange,
  ...rest
}: Omitted & {
  value: number;
  onChange: (next: number) => void;
}) {
  const [text, setText] = useState(() => (value ? intFormatter.format(value) : ""));

  useEffect(() => {
    setText(value ? intFormatter.format(value) : "");
  }, [value]);

  return (
    <Input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={(event) => {
        const raw = event.target.value;
        setText(raw);
        onChange(digitsOnly(raw));
      }}
      onBlur={() => {
        const n = digitsOnly(text);
        setText(n ? intFormatter.format(n) : "");
        onChange(n);
      }}
    />
  );
}

/** Percentages or fractional rates (e.g. commission 7.5) with optional grouping. */
export function CommaDecimalInput({
  value,
  onChange,
  ...rest
}: Omitted & {
  value: number;
  onChange: (next: number) => void;
}) {
  const [text, setText] = useState(() =>
    Number.isFinite(value) && value !== 0 ? decimalFormatter.format(value) : "",
  );

  useEffect(() => {
    if (!Number.isFinite(value) || value === 0) {
      setText("");
      return;
    }
    setText(decimalFormatter.format(value));
  }, [value]);

  return (
    <Input
      {...rest}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      onChange={(event) => {
        const raw = event.target.value;
        setText(raw);
        onChange(parseDecimalLoose(raw));
      }}
      onBlur={() => {
        const n = parseDecimalLoose(text);
        if (!Number.isFinite(n) || n === 0) {
          setText("");
          onChange(0);
          return;
        }
        setText(decimalFormatter.format(n));
        onChange(n);
      }}
    />
  );
}
