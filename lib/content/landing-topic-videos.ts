/**
 * Looping clips for the landing “Shorts” section (one per topic tab, order matches
 * `dictionary.shorts.topics`).
 *
 * Source masters live in `design-reference/videos/`. Shipped assets are
 * **web-optimized** under `/public/landing/topic-{0..4}.mp4` (H.264, yuv420p,
 * max width **1280** by default, CRF 26, `faststart`, no audio — re-encode from
 * masters when they change). Use **960** width for longer sources if size blows up.
 *
 *   ffmpeg -y -i design-reference/videos/the-home-view.MP4 -vf "scale='min(1280,iw)':-2" \
 *     -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset medium \
 *     -movflags +faststart -an -map_metadata -1 public/landing/topic-0.mp4
 *
 * Tab order: Inside the home → home view; Neighbourhood → balcony; Rental process →
 * stairs; Owner’s insight → dining; Living experience → living room.
 */
export const LANDING_TOPIC_VIDEO_SRC: readonly string[] = [
  "/landing/topic-0.mp4",
  "/landing/topic-1.mp4",
  "/landing/topic-2.mp4",
  "/landing/topic-3.mp4",
  "/landing/topic-4.mp4",
];
