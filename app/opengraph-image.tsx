import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph image for the landing page.
 *
 * 1200×630 social card rendered by `next/og` (Satori-based image renderer).
 * Text-only design: no external image fetches, so it's fast and never
 * breaks if Unsplash hiccups.
 *
 * NOTE: Satori requires every <div> with multiple children to have an
 * explicit `display: flex` (or equivalent). Every container below sets it
 * deliberately; don't strip it thinking it's redundant.
 */
export const alt =
  "DreamHomes. Making dreams come true, one home at a time.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          color: "#121212",
          backgroundImage:
            "radial-gradient(circle at 80% 0%, rgba(52,146,223,0.12) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(52,146,223,0.08) 0%, transparent 50%)",
        }}
      >
        {/* Top: brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 36,
              height: 30,
              background: "#3492df",
              opacity: 0.7,
            }}
          />
          <div style={{ display: "flex" }}>DreamHomes</div>
        </div>

        {/* Headline + tagline column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            <div style={{ display: "flex" }}>Making dreams come true,</div>
            <div style={{ display: "flex", color: "#3492df" }}>
              one home at a time.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#666666",
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            A transparent, trust-first property platform connecting owners,
            agents, and applicants across Lagos and Abuja.
          </div>
        </div>

        {/* Bottom: location stamp */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 18,
            color: "#666666",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Lagos · Abuja · Nigeria</div>
          <div style={{ display: "flex" }}>dreamhomes.today</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
