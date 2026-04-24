import type { Metadata } from "next";
import { ProductDetailView } from "@/views/ProductDetailView";
import { products, getProductBySlug } from "@/data/products";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug, "en");
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
