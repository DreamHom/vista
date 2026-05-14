import type { LucideIcon } from "lucide-react";
import {
  Building,
  Building2,
  Castle,
  CircleDollarSign,
  Hotel,
  House,
  KeyRound,
  LayoutGrid,
  Mountain,
  Store,
} from "lucide-react";

/** Rent / buy segmented pills — same icons as listings toolbar. */
export const LISTING_TYPE_PILLS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "", label: "Rent or buy", Icon: Building2 },
  { value: "RENT", label: "Rent", Icon: KeyRound },
  { value: "SALE", label: "Buy", Icon: CircleDollarSign },
];

/** Property shape pills — same icons as listings toolbar. */
export const PROPERTY_TYPE_PILLS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "", label: "Any type", Icon: LayoutGrid },
  { value: "APARTMENT", label: "Apartment", Icon: Building },
  { value: "HOUSE", label: "House", Icon: House },
  { value: "VILLA", label: "Villa", Icon: Castle },
  { value: "COMMERCIAL", label: "Commercial", Icon: Store },
];

const PROPERTY_TYPE_EXTRA: Record<string, LucideIcon> = {
  LAND: Mountain,
  SHORTLET: Hotel,
};

export function iconForListingType(value: string): LucideIcon {
  return LISTING_TYPE_PILLS.find((p) => p.value === value)?.Icon ?? Building2;
}

export function iconForPropertyType(value: string): LucideIcon {
  return (
    PROPERTY_TYPE_PILLS.find((p) => p.value === value)?.Icon ??
    PROPERTY_TYPE_EXTRA[value] ??
    LayoutGrid
  );
}
