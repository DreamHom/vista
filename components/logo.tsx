import Image from "next/image";
import { cn } from "@/lib/utils";

/** Natural pixels of `/public/logo.png` (380×315). Width/height props must preserve this ratio. */
const LOGO_SRC_WIDTH = 380;
const LOGO_SRC_HEIGHT = 315;

/**
 * DreamHomes brand glyph. The source asset is the brand-blue PNG that
 * lives at `/public/logo.png` (and at `app/icon.png` / `app/apple-icon.png`
 * for favicons). Use {@link Logo} for the icon alone, or {@link LogoMark}
 * for the icon + wordmark lockup.
 *
 *   <Logo className="h-7" />
 *   <LogoMark size="lg" />
 */
export interface LogoProps {
  /** Target height in CSS pixels; width is derived from the asset aspect ratio. */
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  const height = size;
  const width = Math.round((size * LOGO_SRC_WIDTH) / LOGO_SRC_HEIGHT);

  return (
    <Image
      src="/logo.png"
      alt="DreamHomes"
      width={width}
      height={height}
      priority
      className={cn("block h-auto w-auto shrink-0", className)}
    />
  );
}

const SIZES = {
  sm: { icon: 18, text: "text-sm", gap: "gap-1.5" },
  md: { icon: 22, text: "text-base", gap: "gap-2" },
  lg: { icon: 30, text: "text-lg", gap: "gap-2.5" },
  xl: { icon: 36, text: "text-xl", gap: "gap-3" },
} as const;

export function LogoMark({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center text-foreground", s.gap, className)}>
      <Logo size={s.icon} />
      <span className={cn("font-semibold tracking-tight", s.text)}>DreamHomes</span>
    </span>
  );
}
