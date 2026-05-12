import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import * as Auth from "@/lib/api/auth";
import { getToken } from "@/lib/api/session";
import { getSessionUser } from "@/lib/api/session-user";
import { AccountProfileForm } from "@/components/profile/account-profile-form";
import { PasswordChangeForm } from "@/components/profile/password-change-form";

export const metadata: Metadata = { title: "Owner · settings" };

export default async function OwnerSettingsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/owner/settings");
  const token = await getToken();
  if (!token) redirect("/login?next=/owner/settings");
  const profile = await Auth.meProfile(token).catch(() => me);

  return (
    <>
      <PageHeader title="Settings" description="Notifications, payouts, account preferences." />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-3xl">
        <Card>
          <CardHeader title="Account" description="Private account details from haven." />
          <CardBody>
            <AccountProfileForm profile={profile} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notifications" description="Real-time pings via Kafka — pick what you actually need." />
          <CardBody className="space-y-3">
            {[
              "New inspection request",
              "Inspection booked / cancelled",
              "Offer received",
              "Offer counter-received",
              "Listing approved / taken down",
              "New comment on a listing",
            ].map((n) => (
              <label key={n} className="flex items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                <span>{n}</span>
                <input type="checkbox" defaultChecked className="accent-brand h-4 w-4" />
              </label>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Payout details" description="Where money lands when deals close." />
          <CardBody className="space-y-5">
            <Field label="Payout bank">
              <Select defaultValue="moniepoint">
                <option value="moniepoint">Moniepoint</option>
                <option value="other">Other Nigerian bank</option>
              </Select>
            </Field>
            <Field label="Account number">
              <Input placeholder="10-digit NUBAN" />
            </Field>
            <Field label="Account name">
              <Input />
            </Field>
          </CardBody>
          <CardFooter>
            <span className="text-xs text-fg-subtle">
              Payout settings are not connected to a backend endpoint yet.
            </span>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Security" description="Change your account password." />
          <CardBody>
            <PasswordChangeForm />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
