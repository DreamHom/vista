import type { MetadataRoute } from "next";

/**
 * Web app manifest: describes the install prompt + standalone app
 * appearance when a user adds the site to their home screen.
 *
 * Theme + background colours match our light-mode tokens. Display is
 * `standalone` so the address bar hides when launched from the home
 * screen, giving it more of an app feel.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DreamHomes",
    short_name: "DreamHomes",
    description:
      "A transparent, trust-first property platform connecting owners, agents, and applicants.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    orientation: "portrait-primary",
    categories: ["business", "lifestyle", "real estate"],
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
