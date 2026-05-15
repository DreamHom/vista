/**
 * Converts values from `<input type="datetime-local">` (`YYYY-MM-DDTHH:mm`, no zone)
 * into ISO-8601 UTC strings (`…Z`) so Haven/Jackson can deserialize `Instant`.
 *
 * Also accepts strings that are already parseable by `Date` (e.g. full ISO with offset).
 */
export function datetimeLocalToInstantJson(value: string): string {
  const v = value.trim();
  if (!v) return v;

  const local = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (local) {
    const [, y, mo, d, h, mi, sec] = local;
    const dt = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      sec ? Number(sec) : 0,
      0,
    );
    if (Number.isNaN(dt.getTime())) {
      throw new RangeError(`Invalid datetime: ${value}`);
    }
    return dt.toISOString();
  }

  const ms = Date.parse(v);
  if (Number.isNaN(ms)) {
    throw new RangeError(`Invalid datetime: ${value}`);
  }
  return new Date(ms).toISOString();
}
