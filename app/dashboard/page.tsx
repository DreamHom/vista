"use client";

import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Authenticated dashboard landing — placeholder for now. F4-F7 turn this into the
 * role-aware dashboard (owner / agent / applicant / admin) once those features ship.
 */
export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {user?.fullName}</h1>
        <p className="mt-2 text-muted-foreground">
          You&apos;re signed in as {role?.toLowerCase()}. Your dashboard appears here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Coming soon</CardTitle>
            <CardDescription>Role-specific actions land here as features ship.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Phase F1 (foundation) is in. Auth, browse, and dashboards are next.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
