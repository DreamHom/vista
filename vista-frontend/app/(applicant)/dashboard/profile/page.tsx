import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AccountProfileForm } from "@/components/profile/account-profile-form";
import * as Auth from "@/lib/api/auth";
import { getToken } from "@/lib/api/session";
import { displayName, getSessionUser } from "@/lib/api/session-user";

export const metadata: Metadata = { title: "Profile" };

export default async function ApplicantProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/dashboard/profile");
  const token = await getToken();
  if (!token) redirect("/login?next=/dashboard/profile");
  const profile = await Auth.meProfile(token).catch(() => me);

  const name = displayName(me);

  return (
    <>
      <PageHeader
        title="Profile"
        description="What people see when you reach out. Account details come from haven."
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        <Card>
          <CardHeader title="Basics" />
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={name} size={64} />
            </div>
            <AccountProfileForm profile={profile} includePreferences />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Preferences"
            description="Saved to your account on haven."
          />
          <CardBody>
            <p className="text-sm text-fg-muted">
              Update your shortlist preferences here so future recommendation and messaging
              surfaces can use the same account data.
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
