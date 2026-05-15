/**
 * Seed listings for the public landing page + listings index. Pure mock data;
 * safe to render server-side, safe to use in Storybook-style examples.
 *
 * When haven exposes the real `/api/listings` endpoint, this file becomes the
 * shape doc / fallback. The field names mirror what we expect haven to return
 * (title, address, price, terms, photos, etc.) so the swap is mechanical.
 */

import { PHOTOS, type SeedPhoto } from "./photos";

export type ListingType = "APARTMENT" | "HOUSE" | "VILLA" | "COMMERCIAL";
export type ListingTerm = "RENT" | "SALE";

export interface SeedListing {
  id: string;
  title: string;
  type: ListingType;
  term: ListingTerm;
  /** Locality + city, e.g. "Lekki Phase 1, Lagos". */
  location: string;
  /** Naira-denominated price. For RENT: per year. For SALE: total. */
  priceNgn: number;
  bedrooms: number | null;
  bathrooms: number | null;
  /** Square meters of interior floor space. */
  sizeSqm: number | null;
  description: string;
  /** First photo is the hero / cover. */
  photos: SeedPhoto[];
  /** Currently a fictional `Verified` flag; we'll wire to real verification later. */
  verified: boolean;
}

const photoById = (id: string): SeedPhoto => {
  const found = PHOTOS.find((p) => p.id === id);
  if (!found) throw new Error(`Seed photo not found: ${id}`);
  return found;
};

export const LISTINGS: readonly SeedListing[] = [
  {
    id: "1",
    title: "Lekki Phase 1 Pool Villa",
    type: "VILLA",
    term: "SALE",
    location: "Lekki Phase 1, Lagos",
    priceNgn: 450_000_000,
    bedrooms: 5,
    bathrooms: 6,
    sizeSqm: 520,
    description:
      "A modern five-bedroom villa designed around its long infinity pool: open plan living, full-height glazing, and a cooks' kitchen. Two service quarters, a private studio, and walled grounds.",
    photos: [
      photoById("1512917774080-9991f1c4c750"),
      photoById("1502672260266-1c1ef2d93688"),
      photoById("1706808886508-e21834b4672c"),
    ],
    verified: true,
  },
  {
    id: "2",
    title: "Banana Island Penthouse",
    type: "APARTMENT",
    term: "RENT",
    location: "Banana Island, Lagos",
    priceNgn: 35_000_000,
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 380,
    description:
      "Top-floor four-bedroom penthouse with wraparound terrace and harbour views. Concierge, secure parking, gym and pool included. Furnished or unfurnished. Your call.",
    photos: [
      photoById("1505843513577-22bb7d21e455"),
      photoById("1665249934445-1de680641f50"),
      photoById("1675279200694-8529c73b1fd0"),
    ],
    verified: true,
  },
  {
    id: "3",
    title: "Old Ikoyi Garden House",
    type: "HOUSE",
    term: "SALE",
    location: "Old Ikoyi, Lagos",
    priceNgn: 280_000_000,
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 410,
    description:
      "A quietly elegant family home set back from the road behind a mature garden. Four en-suite bedrooms, a library, and a generous lounge that opens onto a covered terrace.",
    photos: [
      photoById("1523217582562-09d0def993a6"),
      photoById("1583847268964-b28dc8f51f92"),
      photoById("1512918728675-ed5a9ecdebfd"),
    ],
    verified: true,
  },
  {
    id: "4",
    title: "Maitama Embassy Row Residence",
    type: "VILLA",
    term: "SALE",
    location: "Maitama, Abuja",
    priceNgn: 650_000_000,
    bedrooms: 6,
    bathrooms: 7,
    sizeSqm: 720,
    description:
      "Substantial six-bedroom residence on Embassy Row. Full-height entrance hall, formal and informal lounges, dedicated staff wing. Ready for diplomatic or executive occupancy.",
    photos: [photoById("1691425700585-c108acad6467"), photoById("1585128792020-803d29415281")],
    verified: true,
  },
  {
    id: "5",
    title: "Lakowe Lakefront Retreat",
    type: "HOUSE",
    term: "RENT",
    location: "Lakowe Lakes, Lagos",
    priceNgn: 12_000_000,
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 240,
    description:
      "Three-bedroom retreat fronting the Lakowe lakes. Generous outdoor decking, fully equipped kitchen, and direct course access. Available furnished, year-round.",
    photos: [photoById("1531971589569-0d9370cbe1e5"), photoById("1613575831056-0acd5da8f085")],
    verified: false,
  },
  {
    id: "6",
    title: "Victoria Island Loft",
    type: "APARTMENT",
    term: "RENT",
    location: "Victoria Island, Lagos",
    priceNgn: 8_000_000,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 130,
    description:
      "Open-plan two-bedroom loft on a quiet street. High ceilings, exposed concrete and good light. Fibre internet, 24-hour security, designated parking.",
    photos: [photoById("1583847268964-b28dc8f51f92"), photoById("1675279200694-8529c73b1fd0")],
    verified: true,
  },
  {
    id: "7",
    title: "Eko Atlantic Ocean View",
    type: "APARTMENT",
    term: "SALE",
    location: "Eko Atlantic, Lagos",
    priceNgn: 520_000_000,
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 220,
    description:
      "Three-bedroom corner apartment with unbroken Atlantic views. Curated finishes throughout, smart-home wiring, two parking bays in a serviced tower.",
    photos: [photoById("1564013799919-ab600027ffc6"), photoById("1665249934445-1de680641f50")],
    verified: true,
  },
  {
    id: "8",
    title: "Asokoro Family Home",
    type: "HOUSE",
    term: "RENT",
    location: "Asokoro, Abuja",
    priceNgn: 9_000_000,
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 320,
    description:
      "Detached four-bedroom in a quiet diplomatic enclave. Walled compound, lush garden, and a pergola over the dining terrace. Schools, parks, and the city centre all within reach.",
    photos: [photoById("1513584684374-8bab748fbf90"), photoById("1502672260266-1c1ef2d93688")],
    verified: false,
  },
  {
    id: "9",
    title: "Sangotedo Family Estate Home",
    type: "HOUSE",
    term: "SALE",
    location: "Sangotedo, Lagos",
    priceNgn: 95_000_000,
    bedrooms: 4,
    bathrooms: 3,
    sizeSqm: 260,
    description:
      "Four-bedroom semi-detached on a gated estate. Communal pool and gym, generator and treated water. A practical first home or a strong rental investment.",
    photos: [photoById("1591474200742-8e512e6f98f8")],
    verified: true,
  },
  {
    id: "10",
    title: "Tarkwa Bay Beachfront",
    type: "VILLA",
    term: "RENT",
    location: "Tarkwa Bay, Lagos",
    priceNgn: 18_000_000,
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 290,
    description:
      "Four-bedroom beachfront villa with direct access to Tarkwa's quietest stretch of sand. Outdoor shower, full bar, and sunset-facing terrace. Boats and crew arranged on request.",
    photos: [photoById("1693837851506-93d3d01d4f44"), photoById("1544984243-ec57ea16fe25")],
    verified: true,
  },
  {
    id: "11",
    title: "Lekki Phase 2 Townhouse",
    type: "HOUSE",
    term: "SALE",
    location: "Lekki Phase 2, Lagos",
    priceNgn: 185_000_000,
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 280,
    description:
      "Newly built four-bedroom townhouse on a curated terrace. Solar inverter, BMS, and a shared rooftop lounge. Walkable to schools and the marina.",
    photos: [photoById("1635006459494-c9b9665a666e"), photoById("1585128792020-803d29415281")],
    verified: true,
  },
  {
    id: "12",
    title: "Wuse 2 Office Suite",
    type: "COMMERCIAL",
    term: "RENT",
    location: "Wuse 2, Abuja",
    priceNgn: 15_000_000,
    bedrooms: null,
    bathrooms: 2,
    sizeSqm: 220,
    description:
      "Open-plan office suite on the third floor of a serviced tower. Conference room, breakout area, and dedicated reception. Fibre, generator, two parking bays.",
    photos: [photoById("1706808849780-7a04fbac83ef")],
    verified: true,
  },
];
