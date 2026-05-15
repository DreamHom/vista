/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Emit `.next/standalone` for Docker / self-hosted deploys (`node server.js`).
   * Vercel and similar managed hosts ignore this flag for their own output layout.
   */
  output: "standalone",
  transpilePackages: ["leaflet", "react-leaflet"],
  images: {
    remotePatterns: [
      // Unsplash CDN: used for seed listing photos. See lib/seed/photos.ts.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  /**
   * Next 16 blocks cross-origin dev resources (HMR, JS chunks) by default.
   * That breaks phone-on-LAN testing because hydration never completes;
   * onClick handlers silently no-op and useEffects never run.
   *
   * Whitelist the LAN ranges Mac dev servers typically live on so a phone
   * pointed at `http://192.168.x.x:3000` gets the full client experience.
   * This only affects dev: production builds are unaffected.
   */
  allowedDevOrigins: ["192.168.1.173", "192.168.1.0/24", "10.0.0.0/8"],
};

export default nextConfig;
