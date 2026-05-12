import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icons";
import { AgentProfileForm } from "@/components/profile/agent-profile-form";
import * as Auth from "@/lib/api/auth";
import { getToken } from "@/lib/api/session";
import { getSessionUser } from "@/lib/api/session-user";
import * as Users from "@/lib/api/users";
import { agentFromProfile } from "@/lib/api/adapters";
import { HavenError } from "@/lib/api/http";

export const metadata: Metadata = { title: "Agent · profile" };

export default async function AgentPublicProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/agent/profile");
  const token = await getToken();
  if (!token) redirect("/login?next=/agent/profile");
  const myProfile = await Auth.meProfile(token).catch(() => me);

  const profile = await Users.getUserProfile(me.id).catch((err) => {
    if (err instanceof HavenError && err.status === 404) return null;
    throw err;
  });
  const agent = profile ? agentFromProfile(profile) : null;

  return (
    <>
      <PageHeader
        title="Public profile"
        description="What owners and applicants see before they reach out. Keep it sharp."
        actions={
          <ButtonLink
            href={`/agents/${me.id}`}
            variant="outline"
            leadingIcon={<Icon.Eye size={14} />}
          >
            Preview
          </ButtonLink>
        }
      />

      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        {!agent ? (
          <p className="text-sm text-fg-muted">
            Could not load your public profile from haven. Check that{" "}
            <code className="rounded bg-bg-sunken px-1 text-xs">
              GET /api/users/{me.id}/profile
            </code>{" "}
            returns data for your account.
          </p>
        ) : (
          <>
            <Card>
              <CardHeader title="Bio" description="A few real lines beat a list of buzzwords." />
              <CardBody className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar name={agent.name} src={agent.avatar} size={72} />
                  <div>
                    <Button variant="outline" size="sm" disabled>
                      Change photo
                    </Button>
                    <p className="mt-2 text-xs text-fg-subtle">
                      JPG / PNG · managed in haven when supported
                    </p>
                  </div>
                </div>
                <AgentProfileForm profile={myProfile} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Coverage & specialisations" />
              <CardBody className="space-y-5">
                <Field label="Areas you cover" hint="From haven public profile.">
                  <Input defaultValue={agent.areasCovered.join(", ")} readOnly />
                </Field>
                <Field label="Specialisations">
                  <Input defaultValue={agent.specializations.join(", ")} readOnly />
                </Field>
                <Field label="Languages">
                  <Input defaultValue={agent.languages.join(", ")} readOnly />
                </Field>
              </CardBody>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Badge tone="muted">Profile data is read from haven.</Badge>
                <ButtonLink href={`/agents/${me.id}`} variant="outline">
                  View public page
                </ButtonLink>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader title="Stats" description="From reviews and assignments on haven." />
              <CardBody className="grid gap-4 md:grid-cols-3">
                <Field label="Rating">
                  <Input readOnly defaultValue={String(agent.rating)} />
                </Field>
                <Field label="Reviews">
                  <Input readOnly defaultValue={String(agent.reviews)} />
                </Field>
                <Field label="Verified">
                  <Input readOnly defaultValue={agent.verified ? "Yes" : "No"} />
                </Field>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
