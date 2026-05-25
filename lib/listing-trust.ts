/**
 * Listing trust chips per Haven OpenAPI v1.0.4 (owner identity + property documents).
 */

export type ListingTrustChip = "scam_warning" | "property_verified";

export function resolveListingTrustChips(input: {
  ownerIdentityVerifiedAt: string | null | undefined;
  documentsVerifiedAt: string | null | undefined;
}): ListingTrustChip[] {
  const ownerVerified = Boolean(input.ownerIdentityVerifiedAt);
  const propertyVerified = Boolean(input.documentsVerifiedAt);

  if (!ownerVerified) {
    return ["scam_warning"];
  }
  if (propertyVerified) {
    return ["property_verified"];
  }
  return [];
}

export function listingTrustChipLabel(chip: ListingTrustChip): string {
  switch (chip) {
    case "scam_warning":
      return "Possible scam";
    case "property_verified":
      return "Property verified";
    default:
      return chip;
  }
}
