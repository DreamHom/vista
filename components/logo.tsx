import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * DreamHomes brand glyph. The source asset is the brand-blue PNG that
 * lives at `/public/logo.png` (and at `app/icon.png` / `app/apple-icon.png`
 * for favicons). Use {@link Logo} for the icon alone, or {@link LogoMark}
 * for the icon + wordmark lockup.
 *
 *   <Logo className="h-7 w-7" />
 *   <LogoMark size="lg" />
 */
export interface LogoProps {
  size?: number; // px
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="DreamHomes"
      width={size}
      height={size}
      priority
      className={cn("block shrink-0", className)}
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
