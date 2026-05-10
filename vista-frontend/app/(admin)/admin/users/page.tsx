import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { agents, applicants, owners } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · users" };

type Row = {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  joined: string;
  verified: boolean;
  status: string;
};

const allUsers: Row[] = [
  ...owners.map((o) => ({
    id: o.id,
    name: o.name,
    avatar: o.avatar,
    role: "Owner",
    joined: o.joinedAt,
    verified: o.verified,
    status: "active",
  })),
  ...agents.map((a) => ({
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    role: "Agent",
    joined: a.joinedAt,
    verified: a.verified,
    status: "active",
  })),
  ...applicants.map((a) => ({
    id: a.id,
    name: a.name,
    avatar: a.avatar,
    role: "Applicant",
    joined: a.joinedAt,
    verified: a.trustBadge,
    status: "active",
  })),
];

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Activate, deactivate, suspend, override. Every action logged in the audit trail."
      />
      <div className="px-6 lg:px-8 py-8">
        <Card>
          <CardHeader title={`${allUsers.length} users`} description="Sorted by most recent first." />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-fg-subtle bg-bg-sunken/40">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Verified</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allUsers.map((u) => (
                  <tr key={`${u.role}-${u.id}`} className="hover:bg-bg-sunken/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.avatar} size={32} />
                        <span className="font-medium text-fg">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone="muted">{u.role}</Badge>
                    </td>
                    <td className="px-5 py-4 text-fg-muted">{formatDate(u.joined)}</td>
                    <td className="px-5 py-4">
                      {u.verified ? (
                        <Badge tone="verified">
                          <Icon.ShieldCheck size={10} />
                          Yes
                        </Badge>
                      ) : (
                        <Badge tone="muted">No</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone="success">{u.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button size="sm" variant="ghost">View</Button>
                        <Button size="sm" variant="outline">Suspend</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
