/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ShieldCheck, Star } from "lucide-react";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  SectionCard,
  StatusBadge,
} from "@/components/dashboard/applicant-ui";
import {
  getApplicantProfileData,
  readApplicantProfileDraft,
  saveApplicantProfileDraft,
  submitApplicantVerification,
  updateMyProfileBasics,
} from "@/lib/applicant-dashboard";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { nameAvatarPastelClassName } from "@/lib/name-avatar-seed";
import { cn } from "@/lib/utils";
import { formatDate, firstName } from "@/components/dashboard/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "DH";
}

export function ApplicantProfilePage() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [initialized, setInitialized] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["applicant-profile", user?.id],
    queryFn: () => getApplicantProfileData(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    if (!user?.id || !profileQuery.data || initialized) {
      return;
    }

    const localDraft = readApplicantProfileDraft(user.id);
    setFullName(profileQuery.data.privateProfile.fullName);
    setPhone(profileQuery.data.privateProfile.phone ?? "");
    setBio(localDraft.bio);
    setProfilePhotoDataUrl(localDraft.profilePhotoDataUrl);
    setInitialized(true);
  }, [initialized, profileQuery.data, user?.id]);

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      updateMyProfileBasics({
        fullName,
        phone,
        displayName: firstName(fullName),
      }),
    onSuccess: (result) => {
      if (!user?.id) return;
      saveApplicantProfileDraft(user.id, { bio, profilePhotoDataUrl });
      setUser({
        id: result.userId,
        email: result.email ?? user.email,
        fullName: result.fullName,
        role: result.role,
      });
      toast.success("Profile details updated.");
      void queryClient.invalidateQueries({ queryKey: ["applicant-profile", user.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't update your profile.");
    },
  });

  const verificationMutation = useMutation({
    mutationFn: () => {
      if (!verificationFile) {
        throw new Error("Choose an ID file before submitting for verification.");
      }
      return submitApplicantVerification(verificationFile);
    },
    onSuccess: () => {
      toast.success("Verification submitted for review.");
      setVerificationFile(null);
      if (user?.id) {
        void queryClient.invalidateQueries({ queryKey: ["applicant-profile", user.id] });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "We couldn't submit your verification.");
    },
  });

  function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhotoDataUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  if (profileQuery.isLoading) {
    return <LoadingPanel label="Loading your profile..." />;
  }

  if (profileQuery.isError) {
    return (
      <ErrorPanel
        body={profileQuery.error instanceof Error ? profileQuery.error.message : "We couldn't load your profile."}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const data = profileQuery.data;

  if (!data) {
    return <LoadingPanel label="Loading your profile..." />;
  }

  const verificationStatus = data.publicProfile.identityVerifiedAt
    ? "approved"
    : data.latestIdentityVerification?.status.toLowerCase() ?? "not-submitted";

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Profile"
        title="My profile"
        description="Keep your public trust profile current while DreamHomes shows you exactly how owners and agents see your account."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Public profile preview" description="How your account appears to owners and agents today.">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {profilePhotoDataUrl ? (
                <img
                  src={profilePhotoDataUrl}
                  alt={fullName || "Applicant profile"}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold",
                    nameAvatarPastelClassName(fullName || user?.fullName || "DreamHomes User"),
                  )}
                >
                  {initials(fullName || user?.fullName || "DreamHomes User")}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {fullName || data.publicProfile.fullName}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={data.publicProfile.identityVerifiedAt ? "Applicant Verified" : "Unverified"}
                    variant={data.publicProfile.identityVerifiedAt ? "success" : "outline"}
                  />
                  <StatusBadge label="Applicant" variant="secondary" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border px-4 py-3">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Rating</p>
                <p className="mt-2 flex items-center gap-2 font-medium text-foreground">
                  <Star className="h-4 w-4 text-amber-500" aria-hidden />
                  {data.publicProfile.averageRating?.toFixed(1) ?? "No rating yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-border px-4 py-3">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Reviews</p>
                <p className="mt-2 font-medium text-foreground">{data.publicProfile.reviewCount}</p>
              </div>
              <div className="rounded-2xl border border-border px-4 py-3">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">Member since</p>
                <p className="mt-2 font-medium text-foreground">
                  {data.privateProfile.joinedAt ? formatDate(data.privateProfile.joinedAt) : "Recently joined"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border px-4 py-4">
              <p className="text-sm font-medium text-foreground">About you</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {bio.trim()
                  ? bio
                  : "Add a short bio so agents and owners understand what matters to you in a home search."}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Edit profile" description="Update your visible details and local prototype-only extras.">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveProfileMutation.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-muted-foreground">
                Full name
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </label>
              <label className="space-y-2 text-sm text-muted-foreground">
                Phone
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+234..." />
              </label>
            </div>

            <label className="space-y-2 text-sm text-muted-foreground">
              Bio
              <Textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                placeholder="Tell owners and agents what you value in a neighbourhood, your timeline, or your deal style."
              />
            </label>

            <label className="space-y-2 text-sm text-muted-foreground">
              Profile photo
              <div className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-7 text-muted-foreground">
                  Haven doesn’t expose applicant photo fields yet, so this image is stored locally on this device for the prototype.
                </p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  <Camera className="h-4 w-4" aria-hidden />
                  Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </label>

            <Button type="submit" disabled={saveProfileMutation.isPending}>
              Save profile changes
            </Button>
          </form>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Verification" description="Track your badge state and submit ID when you’re ready.">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Applicant identity badge</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submit a valid NIN slip or accepted identity document for review.
                  </p>
                </div>
                <StatusBadge
                  label={verificationStatus === "approved" ? "Approved" : verificationStatus === "pending" ? "Pending" : verificationStatus === "rejected" ? "Needs attention" : "Not submitted"}
                  variant={
                    verificationStatus === "approved"
                      ? "success"
                      : verificationStatus === "pending"
                        ? "warning"
                        : "outline"
                  }
                />
              </div>
            </div>

            <label className="space-y-2 text-sm text-muted-foreground">
              Upload ID
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(event) => setVerificationFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <Button
              onClick={() => verificationMutation.mutate()}
              disabled={verificationMutation.isPending || verificationStatus === "approved"}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Submit ID for verification
            </Button>

            {data.latestIdentityVerification?.decidedAt ? (
              <p className="text-sm text-muted-foreground">
                Last decision: {formatDate(data.latestIdentityVerification.decidedAt)}
              </p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Reviews received" description="Feedback from owners and agents after completed deals.">
          {data.reviews.length > 0 ? (
            <div className="space-y-4">
              {data.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{review.body}</p>
                      <p className="text-sm text-muted-foreground">Received {formatDate(review.date)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                      <Star className="h-4 w-4 text-amber-500" aria-hidden />
                      {review.rating}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="No reviews received yet"
              body="Once you complete inspections or deals on-platform, owners and agents can leave trust-building feedback here."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
