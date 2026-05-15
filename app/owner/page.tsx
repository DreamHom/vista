import { redirect } from "next/navigation";

export default function OwnerIndexRoute() {
  redirect("/owner/dashboard");
}
