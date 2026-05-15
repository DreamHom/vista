import type { Role } from "@/lib/types";

export function getDefaultDashboardPath(role: Role) {
  switch (role) {
    case "OWNER":
      return "/owner/dashboard";
    case "APPLICANT":
      return "/dashboard";
    case "AGENT":
      return "/agent/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
  }
}
