/**
 * Deterministic “random” map pins in Lagos & Abuja until Haven exposes real coordinates.
 * Same listing id + address always maps to the same point (stable for caching and UX).
 */

const LAGOS_ANCHORS: readonly { lat: number; lng: number }[] = [
  { lat: 6.5244, lng: 3.3792 },
  { lat: 6.4281, lng: 3.4219 },
  { lat: 6.4698, lng: 3.585 },
  { lat: 6.6018, lng: 3.3515 },
  { lat: 6.5245, lng: 3.3505 },
  { lat: 6.4474, lng: 3.4739 },
  { lat: 6.5355, lng: 3.3087 },
  { lat: 6.4541, lng: 3.3947 },
  { lat: 6.4969, lng: 3.3609 },
  { lat: 6.5726, lng: 3.7237 },
];

const ABUJA_ANCHORS: readonly { lat: number; lng: number }[] = [
  { lat: 9.0765, lng: 7.3986 },
  { lat: 9.0579, lng: 7.4951 },
  { lat: 9.0882, lng: 7.4003 },
  { lat: 9.1192, lng: 7.3223 },
  { lat: 9.0027, lng: 7.2631 },
  { lat: 8.9836, lng: 7.2644 },
  { lat: 9.0434, lng: 7.4356 },
  { lat: 9.1089, lng: 7.4797 },
];

export function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(31, h) + input.charCodeAt(i);
  }
  return Math.abs(h);
}

export function inferMapRegion(address: string): "lagos" | "abuja" {
  const a = address.toLowerCase();
  if (
    /abuja|\bfct\b|maitama|wuse|gwarinpa|kubwa|gwagwalada|lokogoma|jabi|asokoro|katampe|durumi|garki/.test(a)
  ) {
    return "abuja";
  }
  if (
    /lagos|\blekki\b|ikeja|yaba|surulere|\bvi\b|victoria island|ikoyi|ajah|gbagada|apapa|ogba|magodo|festac|oshodi|isolo|egbeda/.test(
      a,
    )
  ) {
    return "lagos";
  }
  return hashString(a) % 2 === 0 ? "lagos" : "abuja";
}

export function getListingCoordinates(
  listingId: string,
  address: string,
): { latitude: number; longitude: number } {
  const region = inferMapRegion(address);
  const anchors = region === "abuja" ? ABUJA_ANCHORS : LAGOS_ANCHORS;
  const h = hashString(`${listingId}::${address}`);
  const anchor = anchors[h % anchors.length]!;
  const jitterLat = ((h >> 5) % 2000) / 1_000_000 - 0.001;
  const jitterLng = ((h >> 15) % 2000) / 1_000_000 - 0.001;
  return {
    latitude: anchor.lat + jitterLat,
    longitude: anchor.lng + jitterLng,
  };
}
