/**
 * Canonical production origin (include www). Used for metadataBase, sitemap,
 * robots, and JSON-LD when NEXT_PUBLIC_SITE_URL is not set.
 */
export const DEFAULT_SITE_URL = "https://www.dreamhomes.today";

export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : DEFAULT_SITE_URL;
}
