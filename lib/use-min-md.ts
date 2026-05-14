"use client";

import { useEffect, useState } from "react";

const QUERY = "(min-width: 768px)";

/**
 * True when viewport is Tailwind `md` and up (tablet / desktop).
 * Used to pick native-feeling UI: sheet on small phones, centered dialog wider up.
 */
export function useMinMd(): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return matches;
}
