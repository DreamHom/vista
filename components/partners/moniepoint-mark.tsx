import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Moniepoint wordmark from `design-reference/moniepoint-wordmark.png`, exported
 * as lossy WebP with alpha (`public/partners/moniepoint-wordmark.webp`).
 */
export function MoniepointMark({
  className,
  align = "left",
}: {
  className?: string;
  /** `center` keeps the wordmark visually centred inside the fixed-width frame. */
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "relative h-9 w-[148px] shrink-0 md:h-10 md:w-[164px]",
        className,
      )}
    >
      <Image
        src="/partners/moniepoint-wordmark.webp"
        alt="Moniepoint"
        fill
        className={cn("object-contain", align === "center" ? "object-center" : "object-left")}
        sizes="164px"
        priority={false}
      />
    </div>
  );
}
