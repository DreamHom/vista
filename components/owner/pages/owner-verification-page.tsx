"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOwnerProfileData,
  listOwnerProperties,
  submitOwnerIdentityVerification,
  submitPropertyDocumentsVerification,
} from "@/lib/owner-dashboard";
import { useAuth } from "@/lib/use-auth";
import {
  DashboardPageIntro,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import { formatDateTime } from "@/components/dashboard/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { latestPropertyDocumentsVerification, latestVerificationByType } from "@/lib/verification-helpers";

import { listingTitle } from "./owner-page-primitives";

function PendingVerificationNotice({ submittedAt }: { submittedAt: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
      <p className="text-sm font-semibold text-foreground">Under review</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Review usually takes up to three business days. When there is a decision, your status will update here and you will get a response through your notifications.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Submitted {formatDateTime(submittedAt)}.</p>
    </div>
  );
}

export function OwnerVerificationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [identityFiles, setIdentityFiles] = useState<File[]>([]);
  const [propertyFiles, setPropertyFiles] = useState<Record<number, File[]>>({});

  const profileQuery = useQuery({
    queryKey: ["owner-profile", user?.id],
    queryFn: () => getOwnerProfileData(user!.id),
    enabled: !!user?.id,
  });
  const propertiesQuery = useQuery({
    queryKey: ["owner-properties", user?.id],
    queryFn: () => listOwnerProperties(100),
    enabled: !!user?.id,
  });

  const identityMutation = useMutation({
    mutationFn: () => submitOwnerIdentityVerification(identityFiles),
    onSuccess: async () => {
      toast.success("Owner verification submitted.");
      setIdentityFiles([]);
      await queryClient.invalidateQueries({ queryKey: ["owner-profile", user?.id] });
    },
    onError: () => toast.error("We couldn't submit owner verification right now."),
  });

  const propertyMutation = useMutation({
    mutationFn: ({ propertyId, files }: { propertyId: number; files: File[] }) =>
      submitPropertyDocumentsVerification(propertyId, files),
    onSuccess: async (_, variables) => {
      toast.success("Property documents submitted.");
      setPropertyFiles((state) => ({ ...state, [variables.propertyId]: [] }));
      await queryClient.invalidateQueries({ queryKey: ["owner-profile", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["owner-properties", user?.id] });
    },
    onError: () => toast.error("We couldn't submit those property documents."),
  });

  if (profileQuery.isLoading || propertiesQuery.isLoading) return <LoadingPanel label="Loading verification workspace..." />;
  if (profileQuery.error || propertiesQuery.error) {
    return <ErrorPanel body="We couldn't load verification state from Haven." onRetry={() => void profileQuery.refetch()} />;
  }

  const profile = profileQuery.data!;
  const properties = propertiesQuery.data!.items;
  const latestIdentity = latestVerificationByType(profile.verifications, "OWNER_IDENTITY");
  const identityPending = latestIdentity?.status === "PENDING";

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Trust operations"
        title="Verification"
        description="Track identity review, keep property documents current, and see the history behind every submission."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionCard
          title="Owner identity"
          description={
            identityPending
              ? "Your latest submission is waiting for trust operations."
              : "Submit or resubmit identity documents tied to your owner account."
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                Current status: {latestIdentity?.status ?? "Not submitted"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {latestIdentity?.decidedAt
                  ? `Last decision was recorded ${formatDateTime(latestIdentity.decidedAt)}.`
                  : "Identity verification unlocks stronger trust on your owner profile and listings."}
              </p>
            </div>
            {identityPending && latestIdentity ? (
              <PendingVerificationNotice submittedAt={latestIdentity.submittedAt} />
            ) : (
              <>
                <Input type="file" multiple onChange={(event) => setIdentityFiles(Array.from(event.target.files ?? []))} />
                <Button onClick={() => identityMutation.mutate()} disabled={identityMutation.isPending || identityFiles.length === 0}>
                  {identityMutation.isPending ? "Submitting..." : "Submit owner identity"}
                </Button>
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="What verification unlocks" description="Why the workflow matters to applicants, agents, and DreamHomes trust operations.">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="font-semibold text-foreground">Owner identity</p>
              <p className="mt-2 text-sm text-muted-foreground">Signals accountability to applicants and helps agents trust they are managing real inventory.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="font-semibold text-foreground">Property documents</p>
              <p className="mt-2 text-sm text-muted-foreground">Lets DreamHomes stamp the property itself as verified once the ownership documents pass review.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="font-semibold text-foreground">Submission history</p>
              <p className="mt-2 text-sm text-muted-foreground">Keeps rejection reasons and reviewer notes visible so the next attempt can be cleaner.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Property documents per property" description="Resubmit supporting files on the specific address that needs them.">
        <div className="space-y-4">
          {properties.map((item) => {
            const verification = latestPropertyDocumentsVerification(profile.verifications, item.property.id);
            const docPending = verification?.status === "PENDING";

            return (
              <div key={item.property.id} className="rounded-3xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{listingTitle(item)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.property.address}</p>
                  </div>
                  <StatusBadge
                    label={verification?.status ?? "Not submitted"}
                    variant={
                      verification?.status === "APPROVED"
                        ? "success"
                        : verification?.status === "REJECTED"
                          ? "warning"
                          : verification?.status === "PENDING"
                            ? "secondary"
                            : "outline"
                    }
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {docPending
                    ? "Your documents for this property are in the review queue."
                    : verification?.decidedAt
                      ? `Last decision recorded ${formatDateTime(verification.decidedAt)}. Upload the corrected files for another review pass.`
                      : "Upload the files Haven should attach to the next property-doc verification request."}
                </p>
                {docPending && verification ? (
                  <div className="mt-4">
                    <PendingVerificationNotice submittedAt={verification.submittedAt} />
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Input
                      type="file"
                      multiple
                      className="max-w-sm"
                      onChange={(event) =>
                        setPropertyFiles((state) => ({
                          ...state,
                          [item.property.id]: Array.from(event.target.files ?? []),
                        }))
                      }
                    />
                    <Button
                      onClick={() => propertyMutation.mutate({ propertyId: item.property.id, files: propertyFiles[item.property.id] ?? [] })}
                      disabled={propertyMutation.isPending || (propertyFiles[item.property.id] ?? []).length === 0}
                    >
                      Submit docs
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Submission timeline" description="The latest review history surfaced from Haven.">
        <div className="space-y-3">
          {profile.verifications
            .slice()
            .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
            .map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.type.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submitted {formatDateTime(item.submittedAt)}
                      {item.decidedAt ? ` · decided ${formatDateTime(item.decidedAt)}` : ""}
                    </p>
                  </div>
                  <StatusBadge label={item.status} variant={item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "warning" : "outline"} />
                </div>
              </div>
            ))}
        </div>
      </SectionCard>
    </div>
  );
}

