import type { Metadata } from "next";
import { CategoryView } from "@/views/CategoryView";
import { categories, getCategoryBySlug } from "@/data/categories";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug, "en");
  if (!category) return {};
  return {
    title: category.name,
    description: category.shortDescription,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <CategoryView slug={slug} locale="en" />;
}
