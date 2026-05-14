import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaticPage } from "@/components/public/static-page";
import { getStaticPage, STATIC_PAGES } from "@/lib/public-site";

export async function generateStaticParams() {
  return STATIC_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page) return {};

  return {
    title: page.eyebrow,
    description: page.description,
  };
}

export default async function StaticInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page) notFound();

  return <StaticPage page={page} />;
}
