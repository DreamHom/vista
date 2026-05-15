import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

const SITE_URL = getPublicSiteUrl();

/**
 * Robots policy.
 *
 * Public surfaces (landing, listings) are open for indexing. Authenticated
 * areas (`/dashboard/*`, `/haven/*`) and Next internals are off-limits: no
 * value to a search engine, and we'd rather not leak signed-out screenshots
 * of dashboards into Google's cache.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/haven",
          "/haven/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
