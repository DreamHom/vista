/**
 * Optional looping clips for the landing “Shorts” section (one per topic tab).
 * Self-host files under `/public/landing/` for reliable playback (hotlinking
 * Pexels/Mixkit from the server often returns 403).
 *
 * **Replace with on-brand footage:** download MP4s from e.g.
 * [Pexels house interior](https://www.pexels.com/search/videos/house%20interior/),
 * [Pexels Lagos skyline](https://www.pexels.com/search/videos/lagos/),
 * or [Coverr architecture](https://coverr.co/stock-video-footage/architecture),
 * then drop them here as `topic-0.mp4` … `topic-4.mp4` and update the paths.
 *
 * Keep clips **5–20s**, **muted**, **H.264 + AAC**, and aim for **under ~5MB**
 * each on mobile. The first frame should roughly match the poster still so the
 * cross-fade feels intentional.
 *
 * Current entries point at a tiny generic sample so the `<video>` path is
 * wired end-to-end before you swap in real estate clips.
 */
export const LANDING_TOPIC_VIDEO_SRC: readonly string[] = [
  "/landing/sample-360p.mp4",
  "/landing/sample-360p.mp4",
  "/landing/sample-360p.mp4",
  "/landing/sample-360p.mp4",
  "/landing/sample-360p.mp4",
];
