/**
 * Naira (₦) currency formatting.
 *
 * Manual prefix instead of `Intl.NumberFormat({ currency: "NGN" })` because
 * not every Node ICU build resolves NGN to the ₦ glyph: some print "NGN".
 * We always want ₦.
 *
 *   formatNaira(450_000_000)               // "₦450,000,000"
 *   formatNaira(450_000_000, { compact: true }) // "₦450M"
 *   formatNaira(1_800_000,   { compact: true }) // "₦1.8M"
 *   formatNaira(8_000_000,   { compact: true }) // "₦8M"
 */
export function formatNaira(value: number, options: { compact?: boolean } = {}): string {
  const { compact = false } = options;

  if (compact) {
    const compactFormatter = new Intl.NumberFormat("en-NG", {
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return `₦${compactFormatter.format(value)}`;
  }

  return `₦${new Intl.NumberFormat("en-NG").format(value)}`;
}

/**
 * Grouped-integer helpers for form inputs.
 *
 * Users type raw digits into numeric fields (size in m², bedrooms, asking
 * price, fees). We mirror what they typed back with comma grouping for
 * readability — and round-trip cleanly to a real number when we hit the
 * backend.
 *
 *   formatGroupedIntegerInput("8500000")  // "8,500,000"  (user typing)
 *   formatGroupedIntegerInput("8,500abc") // "8,500"      (strips junk)
 *   formatGroupedIntegerInput("")         // ""           (empty stays empty)
 *
 *   formatStoredGroupedInteger("8500000") // "8,500,000"  (seeding from API)
 *   formatStoredGroupedInteger(undefined) // ""
 *
 *   parseGroupedNumberInput("8,500,000")  // 8500000
 *   parseGroupedNumberInput("8,500abc")   // 8500
 *   parseGroupedNumberInput("")           // null   (caller uses `?? undefined`)
 *   parseGroupedNumberInput("abc")        // null
 */
export function formatGroupedIntegerInput(input: string): string {
  // Strip everything that isn't a digit — defends against pasted strings
  // like "₦8,500,000.00" or "8,500abc". We only support integers in the
  // owner property form (no fractional naira on listings).
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return "";
  // Strip leading zeros so "0008500000" doesn't render as "0,008,500,000".
  // But preserve a single "0" if the user genuinely typed zero.
  const trimmed = digits.replace(/^0+(?=\d)/, "");
  return new Intl.NumberFormat("en-US").format(Number(trimmed));
}

export function formatStoredGroupedInteger(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "";
  return formatGroupedIntegerInput(String(value));
}

export function parseGroupedNumberInput(formatted: string): number | null {
  const digits = formatted.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
