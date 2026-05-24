"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { OwnerAssignmentCard } from "@/components/assignments/owner-assignment-card";
import { listOwnerAssignments } from "@/lib/owner-dashboard";
import { useAuth } from "@/lib/use-auth";
import {
  DashboardPageIntro,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
} from "@/components/dashboard/applicant-ui";
import { Button } from "@/components/ui/button";

export function OwnerAgentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const assignmentsQuery = useQuery({
    queryKey: ["owner-assignments", user?.id],
    queryFn: () => listOwnerAssignments(100),
    enabled: !!user?.id,
  });

  if (assignmentsQuery.isLoading) return <LoadingPanel label="Loading agent assignments..." />;
  if (assignmentsQuery.error) {
    return <ErrorPanel body="We couldn't load agent assignment activity." onRetry={() => assignmentsQuery.refetch()} />;
  }

  const items = assignmentsQuery.data!;

  return (
    <div className="space-y-6">
      <DashboardPageIntro
        eyebrow="Assignment control"
        title="Agent management"
        description="Each row is one invite or active assignment. Declined and revoked rows are terminal — invite again to create a new row."
        actions={
          <Link href="/agents">
            <Button variant="outline">Find an agent</Button>
          </Link>
        }
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <OwnerAssignmentCard
              key={item.assignment.id}
              assignment={item.assignment}
              agentName={item.agentProfile?.fullName ?? `Agent #${item.assignment.agentUserId}`}
              listingTitle={item.listing?.title ?? `Listing #${item.assignment.listingId}`}
              listingLocation={item.listing?.location}
              propertyHref={`/owner/properties/${item.listing?.propertyId ?? item.assignment.listingId}`}
              onChanged={() => queryClient.invalidateQueries({ queryKey: ["owner-assignments", user?.id] })}
            />
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No assignments yet"
          body="Invite an agent from a property detail page when you want help with inspections and day-to-day listing work."
          ctaLabel="Browse agents"
          ctaHref="/agents"
        />
      )}
    </div>
  );
}
