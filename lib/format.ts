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
