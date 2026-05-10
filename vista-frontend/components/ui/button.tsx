import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg hover:bg-brand-hover",
  secondary: "bg-fg text-bg hover:bg-fg/90",
  outline: "border border-border-strong bg-bg-elevated text-fg hover:bg-bg-sunken",
  ghost: "text-fg hover:bg-bg-sunken",
  danger: "bg-danger text-white hover:opacity-90",
  accent: "bg-accent text-accent-fg hover:bg-accent-hover",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button">;
type ButtonLinkProps = CommonProps & { href: string; external?: boolean };

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  leadingIcon,
  trailingIcon,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  leadingIcon,
  trailingIcon,
  href,
  external,
}: ButtonLinkProps) {
  const classes = cn(base, sizes[size], variants[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
