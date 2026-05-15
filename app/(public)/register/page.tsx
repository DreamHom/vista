import { redirect } from "next/navigation";

interface RegisterSearchParams {
  role?: string;
  next?: string;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<RegisterSearchParams>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.next) query.set("next", params.next);
  redirect(query.toString() ? `/signup?${query.toString()}` : "/signup");
}
