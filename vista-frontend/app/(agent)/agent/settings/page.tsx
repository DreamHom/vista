import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Agent · settings" };

export default function AgentSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Notifications, payouts and the booring stuff." />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-3xl">
        <Card>
          <CardHeader title="Notifications" />
          <CardBody className="space-y-3">
            {[
              "New inspection request",
              "New offer received",
              "Counter-offer received",
              "Owner assigned a new listing",
              "Listing flagged or taken down",
              "Review received",
            ].map((n) => (
              <label key={n} className="flex items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                <span>{n}</span>
                <input type="checkbox" defaultChecked className="accent-brand h-4 w-4" />
              </label>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Payouts" description="Where commissions land when deals close." />
          <CardBody className="space-y-5">
            <Field label="Bank">
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
            <span />
            <Button>Save</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
