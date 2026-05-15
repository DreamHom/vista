/**
 * Areas and neighbourhoods surfaced in public browse/search filters.
 * Values are sent as the `location` query param (backend substring match).
 */
export const BROWSE_LOCATION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All areas" },
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Lekki", label: "Lekki" },
  { value: "Ikoyi", label: "Ikoyi" },
  { value: "Victoria Island", label: "Victoria Island" },
  { value: "Banana Island", label: "Banana Island" },
  { value: "Yaba", label: "Yaba" },
  { value: "Surulere", label: "Surulere" },
  { value: "Ajah", label: "Ajah" },
  { value: "Gwarinpa", label: "Gwarinpa" },
  { value: "Maitama", label: "Maitama" },
  { value: "Asokoro", label: "Asokoro" },
];

const KNOWN = new Set(BROWSE_LOCATION_OPTIONS.map((o) => o.value).filter(Boolean));

export function isKnownBrowseLocation(value: string | undefined): boolean {
  const v = value?.trim() ?? "";
  return v.length > 0 && KNOWN.has(v);
}
