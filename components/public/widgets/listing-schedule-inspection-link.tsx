"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

function guestSignupHref(listingId: string) {
  return `/signup?next=${encodeURIComponent(`/listings/${listingId}`)}`;
}

function applicantInspectionHref(listingId: string) {
  return `/dashboard/inspections?listingId=${encodeURIComponent(listingId)}`;
}

/**
 * Listing “schedule inspection” entry: sends signed-in applicants to the
 * inspections workspace; everyone else keeps the signup deep-link. Uses a
 * post-mount href update so the first paint matches SSR (avoids hydration
 * mismatches while still correcting for client-only auth state).
 */
export function ListingScheduleInspectionLink({
  listingId,
  variant = "primary",
  size = "lg",
  className,
  children,
}: {
  listingId: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const href = useMemo(() => {
    if (!mounted) {
      return guestSignupHref(listingId);
    }
    if (hydrated && isAuthenticated && user?.role === "APPLICANT") {
      return applicantInspectionHref(listingId);
    }
    return guestSignupHref(listingId);
  }, [mounted, hydrated, isAuthenticated, user?.role, listingId]);

  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
