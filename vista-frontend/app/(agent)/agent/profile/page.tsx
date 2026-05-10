import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { agents } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Agent · profile" };

const me = agents[0];

export default function AgentPublicProfilePage() {
  return (
    <>
      <PageHeader
        title="Public profile"
        description="What owners and applicants see before they reach out. Keep it sharp."
        actions={
          <ButtonLink href={`/agents/${me.id}`} variant="outline" leadingIcon={<Icon.Eye size={14} />}>
            Preview
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        <Card>
          <CardHeader title="Bio" description="A few real lines beat a list of buzzwords." />
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={me.name} src={me.avatar} size={72} />
              <div>
                <Button variant="outline" size="sm">Change photo</Button>
                <p className="mt-2 text-xs text-fg-subtle">JPG / PNG · 4:5 looks best · max 4MB</p>
              </div>
            </div>
            <Field label="Headline">
              <Input defaultValue={me.headline} />
            </Field>
            <Field label="Bio">
              <Textarea defaultValue={me.bio} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Coverage & specialisations" />
          <CardBody className="space-y-5">
            <Field label="Areas you cover" hint="Comma-separated. Be specific.">
              <Input defaultValue={me.areasCovered.join(", ")} />
            </Field>
            <Field label="Specialisations">
              <Input defaultValue={me.specializations.join(", ")} />
            </Field>
            <Field label="Languages">
              <Input defaultValue={me.languages.join(", ")} />
            </Field>
          </CardBody>
          <CardFooter>
            <Badge tone="muted">Changes show on your profile within 1 minute.</Badge>
            <Button>Save</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader title="Fees" description="Declared up front so applicants come pre-aligned." />
          <CardBody className="grid gap-4 md:grid-cols-3">
            <Field label="Agency fee %">
              <Input type="number" defaultValue={me.feePercent} />
            </Field>
            <Field label="Avg. response time (mins)">
              <Input type="number" defaultValue={me.responseTimeMins} />
            </Field>
            <Field label="Response rate %">
              <Input type="number" defaultValue={me.responseRate} />
            </Field>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
