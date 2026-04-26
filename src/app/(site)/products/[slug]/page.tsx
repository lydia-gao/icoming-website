import type { Metadata } from "next";
import { ProductDetailView } from "@/views/ProductDetailView";
import { getProductBySlugPublic } from "@/lib/products-public";

type Params = { slug: string };

// Route is now dynamic: products are managed in the CMS, slugs may be
// added or removed after build. The cached helpers (revalidate: 60s,
// flushed on admin save) keep TTFB fast.

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugPublic(slug, "en");
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} locale="en" />;
}
