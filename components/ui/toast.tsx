"use client";

import { Toaster as SonnerToaster } from "sonner";
import { toast as sonnerToast } from "sonner";

/**
 * Toast surface. Mounted once at the app root via {@link AppProviders}; throughout
 * the app, call {@link toast} or {@link toast.success} / {@link toast.error} etc.
 *
 * The richColors flag pulls Sonner's accent palette (success/error/warning) so we
 * don't have to hand-roll variant styling. Position bottom-right matches most
 * SaaS conventions and stays out of the way of mobile bottom-tab navigation.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-md border border-border bg-card text-card-foreground shadow-md",
          description: "text-sm text-muted-foreground",
        },
      }}
    />
  );
}

export const toast = sonnerToast;
