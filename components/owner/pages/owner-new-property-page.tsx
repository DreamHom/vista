"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileUp,
  ImagePlus,
  MapPin,
  Plus,
  Sparkles,
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
import { formatNaira } from "@/lib/format";
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

export function OwnerNewPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OwnerPropertyFormDraft>(() =>
    user ? readOwnerPropertyDraft(user.id) : DEFAULT_PROPERTY_DRAFT,
  );
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      setDraft(readOwnerPropertyDraft(user.id));
    }
  }, [user]);

  function updateDraft(next: Partial<OwnerPropertyFormDraft>) {
    setDraft((current) => {
      const updated = { ...current, ...next };
      if (user) saveOwnerPropertyDraft(user.id, updated);
      return updated;
    });
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      const property = await createOwnerProperty({
        address: draft.basic.address,
        type: draft.basic.type,
        bedrooms: draft.basic.bedrooms ? Number(draft.basic.bedrooms) : undefined,
        bathrooms: draft.basic.bathrooms ? Number(draft.basic.bathrooms) : undefined,
        sizeSqm: draft.basic.sizeSqm ? Number(draft.basic.sizeSqm) : undefined,
        description: draft.basic.description,
      });

      const listing = await createOwnerListing({
        propertyId: property.id,
        listingType: draft.terms.listingType,
        askingPrice: Number(draft.terms.askingPrice || 0),
        cautionFee: draft.terms.cautionFee ? Number(draft.terms.cautionFee) : undefined,
        serviceCharge: draft.terms.serviceCharge ? Number(draft.terms.serviceCharge) : undefined,
        agencyFee: draft.terms.agencyFee ? Number(draft.terms.agencyFee) : undefined,
        title: `${draft.basic.type.replaceAll("_", " ")} in ${draft.basic.address.split(",")[0] ?? "DreamHomes"}`,
        headline: draft.terms.negotiable ? "Negotiable terms available" : "Fixed pricing",
        description: draft.basic.description,
        handoverDate: draft.terms.availabilityDate || undefined,
      });

      await Promise.all(photoFiles.map((file, index) => uploadOwnerListingPhoto(listing.id, file, draft.photos[index]?.caption)));

      if (docFiles.length > 0) {
        await submitPropertyDocumentsVerification(property.id, docFiles);
      }

      return property.id;
    },
    onSuccess: async (propertyId) => {
      toast.success("Property created and listing published.");
      if (user) saveOwnerPropertyDraft(user.id, DEFAULT_PROPERTY_DRAFT);
      await queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      router.push(`/owner/properties/${propertyId}`);
    },
    onError: () => {
      toast.error("We couldn't complete the full property submission. Your draft is still here.");
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
                value={draft.basic.sizeSqm}
                onChange={(event) => updateDraft({ basic: { ...draft.basic, sizeSqm: event.target.value } })}
                placeholder="145"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Bedrooms</FieldLabel>
              <Input
                value={draft.basic.bedrooms}
                onChange={(event) => updateDraft({ basic: { ...draft.basic, bedrooms: event.target.value } })}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Bathrooms</FieldLabel>
              <Input
                value={draft.basic.bathrooms}
                onChange={(event) => updateDraft({ basic: { ...draft.basic, bathrooms: event.target.value } })}
                placeholder="2"
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
              <Input
                value={draft.terms.askingPrice}
                onChange={(event) => updateDraft({ terms: { ...draft.terms, askingPrice: event.target.value } })}
                placeholder="8500000"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Caution fee</FieldLabel>
              <Input
                value={draft.terms.cautionFee}
                onChange={(event) => updateDraft({ terms: { ...draft.terms, cautionFee: event.target.value } })}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Service charge</FieldLabel>
              <Input
                value={draft.terms.serviceCharge}
                onChange={(event) =>
                  updateDraft({ terms: { ...draft.terms, serviceCharge: event.target.value } })
                }
                placeholder="150000"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Agency fee</FieldLabel>
              <Input
                value={draft.terms.agencyFee}
                onChange={(event) => updateDraft({ terms: { ...draft.terms, agencyFee: event.target.value } })}
                placeholder="850000"
              />
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
        <SectionCard title="Photos" description="Upload photo files for the live listing and keep captions for your own internal context.">
          <div className="space-y-5">
            <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-full bg-white p-3">
                  <ImagePlus className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Select photo files</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, or WEBP. DreamHomes will append these to the gallery in upload order.</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setPhotoFiles(files);
                    updateDraft({
                      photos: files.map((file) => ({ name: file.name, caption: "" })),
                    });
                  }}
                />
                <span className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Choose images
                </span>
              </label>
            </div>

            {draft.photos.length > 0 ? (
              <div className="space-y-3">
                {draft.photos.map((photo, index) => (
                  <div key={`${photo.name}-${index}`} className="grid gap-3 rounded-2xl border border-border bg-white p-4 md:grid-cols-[1fr_minmax(0,280px)]">
                    <div>
                      <p className="text-sm font-medium text-foreground">{photo.name}</p>
                      <p className="text-sm text-muted-foreground">Will upload to the listing on the final step.</p>
                    </div>
                    <Input
                      value={photo.caption}
                      onChange={(event) => {
                        const nextPhotos = [...draft.photos];
                        nextPhotos[index] = { ...nextPhotos[index], caption: event.target.value };
                        updateDraft({ photos: nextPhotos });
                      }}
                      placeholder="Optional caption"
                    />
                  </div>
                ))}
              </div>
            ) : null}

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

