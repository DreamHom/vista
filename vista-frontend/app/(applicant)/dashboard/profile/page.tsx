import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { applicants } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Profile" };

const me = applicants[0];

export default function ApplicantProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Owners and agents see this when you request an inspection. Keep it tight, real, and unembarrassing."
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        <Card>
          <CardHeader title="Basics" description="What people see when you reach out." />
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={me.name} src={me.avatar} size={64} />
              <Button variant="outline" size="sm">Change photo</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name">
                <Input defaultValue={me.name} />
              </Field>
              <Field label="Phone">
                <Input defaultValue="+234 803 555 0123" />
              </Field>
            </div>
            <Field label="Email">
              <Input type="email" defaultValue="daniel@example.com" />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="What you're after" description="Helps Dream AI rank matches faster." />
          <CardBody>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Intent">
                <Select defaultValue={me.intent}>
                  <option value="rent">Renting</option>
                  <option value="sale">Buying</option>
                </Select>
              </Field>
              <Field label="Preferred city">
                <Input defaultValue={me.city} />
              </Field>
              <Field label="Min budget">
                <Input type="number" defaultValue={me.budgetMin} />
              </Field>
              <Field label="Max budget">
                <Input type="number" defaultValue={me.budgetMax} />
              </Field>
            </div>
            <div className="mt-5">
              <Button>Save changes</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
