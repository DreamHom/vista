"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  ImagePlus,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  changeMyPassword,
  getNotificationHref,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  respondToOffer,
  updateMyProfileBasics,
} from "@/lib/applicant-dashboard";
import {
  counterOwnerOffer,
  createInspectionSlot,
  createOwnerListing,
  createOwnerProperty,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_OWNER_PROFILE_DRAFT,
  DEFAULT_PROPERTY_DRAFT,
  getOwnerDashboardOverview,
  getOwnerProfileData,
  getOwnerPropertyManagement,
  inviteAgentToListing,
  listOwnerAssignments,
  listOwnerComments,
  listOwnerInspectionItems,
  listOwnerLeads,
  listOwnerListings,
  listOwnerOffers,
  listOwnerProperties,
  readInspectionNotes,
  readOwnerNotificationPreferences,
  readOwnerProfileDraft,
  readOwnerPropertyDraft,
  removeListingComment,
  replyToListingComment,
  revokeAgentAssignment,
  saveInspectionNote,
  saveInspectionStatus,
  saveOwnerNotificationPreferences,
  saveOwnerProfileDraft,
  saveOwnerPropertyDraft,
  searchAssignableAgents,
  submitOwnerIdentityVerification,
  submitPropertyDocumentsVerification,
  toggleLeadShortlist,
  updateOwnerListing,
  uploadOwnerListingPhoto,
  type AgentListingResponse,
  type CommentResponse,
  type OwnerManagedProperty,
  type OwnerProfileDraft,
  type OwnerPropertyFormDraft,
} from "@/lib/owner-dashboard";
import { useAuth } from "@/lib/use-auth";
import { ApiError, NetworkError } from "@/lib/api";
import { formatGroupedIntegerInput, formatNaira, formatStoredGroupedInteger, parseGroupedNumberInput } from "@/lib/format";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  SectionCard,
  SettingsToggle,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import {
  firstName,
  formatDate,
  formatDateTime,
  getGreeting,
  offerStatusLabel,
  offerStatusVariant,
} from "@/components/dashboard/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { FieldLabel, FieldHint, NativeSelect, PrototypeNotice } from "./owner-page-primitives";

type PendingListingPhoto = {
  id: string;
  file: File;
  caption: string;
  previewUrl: string;
};

type PhotoUploadFailure = { fileName: string; reason: string };

type SubmitResult = {
  propertyId: number;
  photoAttempted: number;
  photoSucceeded: number;
  photoFailures: PhotoUploadFailure[];
  docFailure: string | null;
};

/**
 * Map errors from `uploadOwnerListingPhoto` / `submitPropertyDocumentsVerification`
 * to per-file human messages. Different statuses are different stories: 413 is
 * "your file's too big", 415 is "wrong format", 5xx is "haven is having a bad
 * day". The generic "upload failed" is reserved for truly unknown errors.
 */
function describeUploadError(err: unknown, fileName: string): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        return `${fileName}: session expired, sign in again`;
      case 403:
        return `${fileName}: not permitted to attach photos here`;
      case 413:
        return `${fileName}: too large, try compressing below ~10 MB`;
      case 415:
        return `${fileName}: unsupported format (use JPG, PNG, or WEBP)`;
      case 422:
        return `${fileName}: ${err.problem?.detail ?? "rejected by haven"}`;
      case 429:
        return `${fileName}: too many uploads at once, try again in a moment`;
      default:
        if (err.status >= 500) {
          return `${fileName}: haven couldn't store this one (status ${err.status})`;
        }
        return `${fileName}: ${err.problem?.detail ?? err.message}`;
    }
  }
  if (err instanceof NetworkError) {
    return `${fileName}: lost connection during upload`;
  }
  if (err instanceof Error) {
    return `${fileName}: ${err.message}`;
  }
  return `${fileName}: upload failed`;
}

function makePendingPhoto(file: File): PendingListingPhoto {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${file.name}-${Date.now()}-${Math.random()}`,
    file,
    caption: "",
    previewUrl: URL.createObjectURL(file),
  };
}

export function OwnerNewPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OwnerPropertyFormDraft>(() =>
    user ? readOwnerPropertyDraft(user.id) : DEFAULT_PROPERTY_DRAFT,
  );
  const [pendingPhotos, setPendingPhotos] = useState<PendingListingPhoto[]>([]);
  const pendingPhotosRef = useRef<PendingListingPhoto[]>([]);
  pendingPhotosRef.current = pendingPhotos;
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user) return;
    const d = readOwnerPropertyDraft(user.id);
    setDraft({
      ...d,
      basic: {
        ...d.basic,
        sizeSqm: d.basic.sizeSqm ? formatStoredGroupedInteger(d.basic.sizeSqm) : "",
        bedrooms: d.basic.bedrooms ? formatStoredGroupedInteger(d.basic.bedrooms) : "",
        bathrooms: d.basic.bathrooms ? formatStoredGroupedInteger(d.basic.bathrooms) : "",
      },
      terms: {
        ...d.terms,
        askingPrice: d.terms.askingPrice ? formatStoredGroupedInteger(d.terms.askingPrice) : "",
        cautionFee: d.terms.cautionFee ? formatStoredGroupedInteger(d.terms.cautionFee) : "",
        serviceCharge: d.terms.serviceCharge ? formatStoredGroupedInteger(d.terms.serviceCharge) : "",
        agencyFee: d.terms.agencyFee ? formatStoredGroupedInteger(d.terms.agencyFee) : "",
      },
    });
  }, [user]);

  useEffect(() => {
    return () => {
      for (const p of pendingPhotosRef.current) {
        URL.revokeObjectURL(p.previewUrl);
      }
    };
  }, []);

  function updateDraft(next: Partial<OwnerPropertyFormDraft>) {
    setDraft((current) => {
      const updated = { ...current, ...next };
      if (user) saveOwnerPropertyDraft(user.id, updated);
      return updated;
    });
  }

  function syncPhotoDraftFromQueue(queue: PendingListingPhoto[]) {
    setDraft((current) => {
      const updated = {
        ...current,
        photos: queue.map((p) => ({ name: p.file.name, caption: p.caption })),
      };
      if (user) saveOwnerPropertyDraft(user.id, updated);
      return updated;
    });
  }

  function appendListingPhotos(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length < files.length) {
      toast.info("Some files were skipped", {
        description: "Only image uploads are supported for listing photos.",
      });
    }
    if (imageFiles.length === 0) return;
    setPendingPhotos((prev) => {
      const next = [...prev, ...imageFiles.map((file) => makePendingPhoto(file))];
      queueMicrotask(() => syncPhotoDraftFromQueue(next));
      return next;
    });
  }

  function removePendingPhoto(id: string) {
    setPendingPhotos((prev) => {
      const victim = prev.find((p) => p.id === id);
      if (victim) URL.revokeObjectURL(victim.previewUrl);
      const next = prev.filter((p) => p.id !== id);
      queueMicrotask(() => syncPhotoDraftFromQueue(next));
      return next;
    });
  }

  function updatePendingPhotoCaption(id: string, caption: string) {
    setPendingPhotos((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, caption } : p));
      queueMicrotask(() => syncPhotoDraftFromQueue(next));
      return next;
    });
  }

  const submitMutation = useMutation<SubmitResult>({
    mutationFn: async (): Promise<SubmitResult> => {
      // Property + listing are the "atomic" pre-flight: if either fails, the
      // whole submission is treated as failed and the draft stays put.
      const property = await createOwnerProperty({
        address: draft.basic.address,
        type: draft.basic.type,
        bedrooms: draft.basic.bedrooms ? parseGroupedNumberInput(draft.basic.bedrooms) ?? undefined : undefined,
        bathrooms: draft.basic.bathrooms ? parseGroupedNumberInput(draft.basic.bathrooms) ?? undefined : undefined,
        sizeSqm: draft.basic.sizeSqm ? parseGroupedNumberInput(draft.basic.sizeSqm) ?? undefined : undefined,
        description: draft.basic.description,
      });

      const listing = await createOwnerListing({
        propertyId: property.id,
        listingType: draft.terms.listingType,
        askingPrice: parseGroupedNumberInput(draft.terms.askingPrice) ?? 0,
        cautionFee: draft.terms.cautionFee ? parseGroupedNumberInput(draft.terms.cautionFee) ?? undefined : undefined,
        serviceCharge: draft.terms.serviceCharge ? parseGroupedNumberInput(draft.terms.serviceCharge) ?? undefined : undefined,
        agencyFee: draft.terms.agencyFee ? parseGroupedNumberInput(draft.terms.agencyFee) ?? undefined : undefined,
        title: `${draft.basic.type.replaceAll("_", " ")} in ${draft.basic.address.split(",")[0] ?? "DreamHomes"}`,
        headline: draft.terms.negotiable ? "Negotiable terms available" : "Fixed pricing",
        description: draft.basic.description,
        handoverDate: draft.terms.availabilityDate || undefined,
      });

      // Photos: each file gets its own try/catch so one bad file doesn't kill
      // the rest. A 201 with an empty `url` counts as failure too — haven would
      // otherwise report success while the photo never persisted.
      const uploadQueue = pendingPhotosRef.current;
      const photoFailures: PhotoUploadFailure[] = [];
      let photoSucceeded = 0;

      for (const item of uploadQueue) {
        try {
          const response = await uploadOwnerListingPhoto(
            listing.id,
            item.file,
            item.caption.trim() ? item.caption.trim() : undefined,
          );
          if (!response?.url || !response.url.trim()) {
            photoFailures.push({
              fileName: item.file.name,
              reason: `${item.file.name}: haven accepted the upload but didn't return a URL`,
            });
          } else {
            photoSucceeded += 1;
          }
        } catch (err) {
          photoFailures.push({
            fileName: item.file.name,
            reason: describeUploadError(err, item.file.name),
          });
        }
      }

      // Documents: also non-blocking. If property/listing are saved, we don't
      // want a verification snag to throw out the entire submission.
      let docFailure: string | null = null;
      if (docFiles.length > 0) {
        try {
          await submitPropertyDocumentsVerification(property.id, docFiles);
        } catch (err) {
          docFailure = describeUploadError(err, "Property documents");
        }
      }

      return {
        propertyId: property.id,
        photoAttempted: uploadQueue.length,
        photoSucceeded,
        photoFailures,
        docFailure,
      };
    },
    onSuccess: async (result) => {
      const { propertyId, photoAttempted, photoSucceeded, photoFailures, docFailure } = result;

      const snapshot = [...pendingPhotosRef.current];
      for (const p of snapshot) {
        URL.revokeObjectURL(p.previewUrl);
      }
      setPendingPhotos([]);
      if (user) saveOwnerPropertyDraft(user.id, DEFAULT_PROPERTY_DRAFT);

      const describeFailures = (failures: PhotoUploadFailure[]) => {
        const top = failures.slice(0, 3).map((f) => f.reason).join(" · ");
        const more = failures.length > 3 ? ` (and ${failures.length - 3} more)` : "";
        return `${top}${more}`;
      };

      if (photoFailures.length === 0 && !docFailure) {
        toast.success("Property created and listing published.");
      } else if (photoAttempted > 0 && photoFailures.length === photoAttempted) {
        // Property + listing live, but every photo failed. Send the user to the
        // detail page where they can re-upload from the gallery section.
        toast.error("Property and listing saved. Photos didn't upload.", {
          description: `${describeFailures(photoFailures)} · Re-upload from the property page.`,
        });
      } else if (photoFailures.length > 0) {
        toast.warning(`${photoSucceeded} of ${photoAttempted} photos uploaded.`, {
          description: describeFailures(photoFailures),
        });
      }

      if (docFailure) {
        toast.error("Property documents couldn't be submitted for verification.", {
          description: `${docFailure} · You can resubmit from the property page.`,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      if (user) {
        await queryClient.invalidateQueries({ queryKey: ["owner-property", user.id, propertyId] });
      }
      router.push(`/owner/properties/${propertyId}`);
    },
    onError: (err: unknown) => {
      // Only fires if property OR listing creation throws. Photos and docs are
      // captured inside mutationFn and reported via onSuccess.
      if (err instanceof ApiError) {
        if (err.isUnauthorized) {
          toast.error("Your session ended.", {
            description: "Sign in again, your draft is still saved on this device.",
          });
        } else if (err.isValidation) {
          toast.error("Haven flagged something on the form.", {
            description: err.problem?.detail ?? err.problem?.title ?? "Check the fields above and try again.",
          });
        } else if (err.status >= 500) {
          toast.error("Haven is having trouble right now.", {
            description: "Your draft is safe. Try again in a moment.",
          });
        } else {
          toast.error("We couldn't create the property.", {
            description: err.problem?.detail ?? err.message,
          });
        }
      } else if (err instanceof NetworkError) {
        toast.error("Lost connection.", {
          description: "Your draft is safe. Reconnect and try again.",
        });
      } else {
        toast.error("We couldn't complete the property submission. Your draft is still here.");
      }
    },
  });

  const stepLabels = ["Basic details", "Terms", "Photos", "Documents"];

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="New property"
        title="Add Property"
        description="Create the asset, publish the listing, upload visuals, and line up the documents that will help DreamHomes trust it faster."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              if (user) saveOwnerPropertyDraft(user.id, draft);
              toast.success("Draft saved locally.");
            }}
          >
            Save as draft
          </Button>
        }
      />

      <SectionCard title="Progress" description="Move through the steps in order; the final submit will create the property, publish the listing, and upload anything you've attached.">
        <div className="grid gap-3 md:grid-cols-4">
          {stepLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "rounded-2xl border px-4 py-4 text-left transition-colors",
                step === index ? "border-primary bg-primary/5" : "border-border bg-secondary/30",
              )}
            >
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Step {index + 1}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {step === 0 ? (
        <SectionCard title="Basic details" description="Address, property type, and what the space actually is.">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel>Address</FieldLabel>
              <Input
                value={draft.basic.address}
                onChange={(event) => updateDraft({ basic: { ...draft.basic, address: event.target.value } })}
                placeholder="12B Admiralty Way, Lekki Phase 1, Lagos"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Property type</FieldLabel>
              <NativeSelect
                value={draft.basic.type}
                onChange={(event) =>
                  updateDraft({
                    basic: { ...draft.basic, type: event.target.value as OwnerPropertyFormDraft["basic"]["type"] },
                  })
                }
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="SELF_CONTAIN">Self contain</option>
                <option value="MINI_FLAT">Mini flat</option>
                <option value="STUDIO">Studio</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="LAND">Land</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <FieldLabel>Size (sqm)</FieldLabel>
              <Input
                inputMode="numeric"
                value={draft.basic.sizeSqm}
                onChange={(event) =>
                  updateDraft({ basic: { ...draft.basic, sizeSqm: formatGroupedIntegerInput(event.target.value) } })
                }
                placeholder="e.g. 1,450"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Bedrooms</FieldLabel>
              <Input
                inputMode="numeric"
                value={draft.basic.bedrooms}
                onChange={(event) =>
                  updateDraft({ basic: { ...draft.basic, bedrooms: formatGroupedIntegerInput(event.target.value) } })
                }
                placeholder="e.g. 3"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Bathrooms</FieldLabel>
              <Input
                inputMode="numeric"
                value={draft.basic.bathrooms}
                onChange={(event) =>
                  updateDraft({ basic: { ...draft.basic, bathrooms: formatGroupedIntegerInput(event.target.value) } })
                }
                placeholder="e.g. 2"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                rows={6}
                value={draft.basic.description}
                onChange={(event) => updateDraft({ basic: { ...draft.basic, description: event.target.value } })}
                placeholder="Quiet corner apartment with sea breeze, generous natural light, and a dependable power setup."
              />
            </div>
          </div>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="Terms" description="What the market sees first: rent or sale intent, price, and the operational fees around it.">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Rent or sale</FieldLabel>
              <NativeSelect
                value={draft.terms.listingType}
                onChange={(event) =>
                  updateDraft({
                    terms: { ...draft.terms, listingType: event.target.value as "RENT" | "SALE" },
                  })
                }
              >
                <option value="RENT">Rent</option>
                <option value="SALE">Sale</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <FieldLabel>Availability / handover date</FieldLabel>
              <Input
                type="date"
                value={draft.terms.availabilityDate}
                onChange={(event) =>
                  updateDraft({ terms: { ...draft.terms, availabilityDate: event.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Asking price</FieldLabel>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums">₦</span>
                <Input
                  inputMode="numeric"
                  className="pl-7 tabular-nums"
                  value={draft.terms.askingPrice}
                  onChange={(event) =>
                    updateDraft({ terms: { ...draft.terms, askingPrice: formatGroupedIntegerInput(event.target.value) } })
                  }
                  placeholder="8,500,000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>
                Caution fee
                <span className="ml-2 text-[10px] font-normal uppercase tracking-eyebrow text-muted-foreground">Optional</span>
              </FieldLabel>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums">₦</span>
                <Input
                  inputMode="numeric"
                  className="pl-7 tabular-nums"
                  value={draft.terms.cautionFee}
                  onChange={(event) =>
                    updateDraft({ terms: { ...draft.terms, cautionFee: formatGroupedIntegerInput(event.target.value) } })
                  }
                  placeholder="Leave empty if none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>
                Service charge
                <span className="ml-2 text-[10px] font-normal uppercase tracking-eyebrow text-muted-foreground">Optional</span>
              </FieldLabel>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums">₦</span>
                <Input
                  inputMode="numeric"
                  className="pl-7 tabular-nums"
                  value={draft.terms.serviceCharge}
                  onChange={(event) =>
                    updateDraft({ terms: { ...draft.terms, serviceCharge: formatGroupedIntegerInput(event.target.value) } })
                  }
                  placeholder="Leave empty if none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>
                Agency fee
                <span className="ml-2 text-[10px] font-normal uppercase tracking-eyebrow text-muted-foreground">Optional</span>
              </FieldLabel>
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground tabular-nums">₦</span>
                <Input
                  inputMode="numeric"
                  className="pl-7 tabular-nums"
                  value={draft.terms.agencyFee}
                  onChange={(event) =>
                    updateDraft({ terms: { ...draft.terms, agencyFee: formatGroupedIntegerInput(event.target.value) } })
                  }
                  placeholder="Leave empty if none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <SettingsToggle
                title="Negotiable"
                description="This is stored as a local workspace note for now; Haven v1.0.1 doesn't persist a negotiable flag yet."
                checked={draft.terms.negotiable}
                onCheckedChange={(next) => updateDraft({ terms: { ...draft.terms, negotiable: next } })}
              />
            </div>
          </div>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard
          title="Photos"
          description="Add images as many times as you like. Each batch is appended. Order here is the order sent to Haven (first photo becomes the gallery lead)."
        >
          <div className="space-y-6">
            <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-5">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-white p-3">
                  <ImagePlus className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Add listing photos</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, or WEBP. Choose one or many; you can come back and add more. Remove any thumbnail before submit if you change your mind.
                  </p>
                </div>
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const picked = Array.from(event.target.files ?? []);
                    appendListingPhotos(picked);
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  onClick={() => photoFileInputRef.current?.click()}
                >
                  Choose images
                </button>
              </div>
            </div>

            {draft.photos.length > 0 && pendingPhotos.length === 0 ? (
              <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                This device can&apos;t restore image files from a saved draft after a refresh. Use{" "}
                <span className="font-medium">Choose images</span> to queue photos again before you submit.
              </p>
            ) : null}

            {pendingPhotos.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                  {pendingPhotos.length} photo{pendingPhotos.length === 1 ? "" : "s"} queued
                </p>
                <ul className="mt-4 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingPhotos.map((photo, index) => (
                    <li
                      key={photo.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="relative aspect-[4/3] bg-muted">
                        <img
                          src={photo.previewUrl}
                          alt={photo.file.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePendingPhoto(photo.id)}
                          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:bg-black/75"
                          aria-label={`Remove ${photo.file.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="space-y-1.5 p-3">
                        <p className="truncate text-xs font-medium text-foreground" title={photo.file.name}>
                          {photo.file.name}
                        </p>
                        <Input
                          value={photo.caption}
                          onChange={(event) => updatePendingPhotoCaption(photo.id, event.target.value)}
                          placeholder="Optional caption"
                          className="h-9 text-xs"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No photos queued yet. Add at least one before publishing if you want a rich gallery.</p>
            )}

            <div className="space-y-2">
              <FieldLabel>Virtual tour link</FieldLabel>
              <Input
                value={draft.virtualTourLink}
                onChange={(event) => updateDraft({ virtualTourLink: event.target.value })}
                placeholder="https://..."
              />
              <FieldHint>Stored in the local draft for now. Haven v1.0.1 has no dedicated virtual-tour field yet.</FieldHint>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="Documents" description="Upload proof of ownership so DreamHomes can evaluate the property verification request.">
          <div className="space-y-5">
            <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-white p-3">
                  <FileUp className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Attach ownership documents</p>
                  <p className="text-sm text-muted-foreground">C of O, deed of assignment, or any proof you&apos;ll want the verification reviewer to see.</p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setDocFiles(files);
                    updateDraft({
                      documents: files.map((file) => ({ name: file.name, kind: file.name })),
                    });
                  }}
                />
                <span className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Choose documents
                </span>
              </label>
            </div>

            {draft.documents.length > 0 ? (
              <div className="space-y-3">
                {draft.documents.map((document, index) => (
                  <div key={`${document.name}-${index}`} className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-sm font-medium text-foreground">{document.name}</p>
                    <p className="text-sm text-muted-foreground">Will be uploaded with the property verification request.</p>
                  </div>
                ))}
              </div>
            ) : null}

            <PrototypeNotice
              title="Documents are real. Draft memory is local."
              body="The final submit will upload your selected files to Haven and create a verification request. The draft itself stays in browser storage until you submit."
            />
          </div>
        </SectionCard>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}>
          Back
        </Button>
        <div className="flex flex-wrap gap-3">
          {step < stepLabels.length - 1 ? (
            <Button onClick={() => setStep((current) => Math.min(current + 1, stepLabels.length - 1))}>
              Next step
            </Button>
          ) : (
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !draft.basic.address || !draft.terms.askingPrice}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit for listing"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

