import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names — combines `clsx` (conditional/variadic input)
 * with `tailwind-merge` (resolves conflicting utility classes intelligently).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
