import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { getListing } from "@/lib/mock-data";
import { PROPERTY_TYPES } from "@/lib/constants";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = getListing(id);
  if (!l) notFound();

  return (
    <>
      <PageHeader
        title={`Edit · ${l.title}`}
        description="Changes go live immediately. Major changes (price, fees) require a new admin review for the documents badge."
      />
      <div className="px-6 lg:px-8 py-8 grid gap-6 max-w-4xl">
        <Card>
          <CardHeader title="Listing details" />
          <CardBody className="space-y-5">
            <Field label="Title">
              <Input defaultValue={l.title} />
            </Field>
            <Field label="Description">
              <Textarea defaultValue={l.description} />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Type">
                <Select defaultValue={l.type}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Bedrooms">
                <Input type="number" defaultValue={l.bedrooms} />
              </Field>
              <Field label="Bathrooms">
                <Input type="number" defaultValue={l.bathrooms} />
              </Field>
            </div>
          </CardBody>
          <CardFooter>
            <ButtonLink href={`/owner/listings/${l.id}`} variant="ghost">Cancel</ButtonLink>
            <Button trailingIcon={<Icon.Check size={14} />}>Save changes</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
