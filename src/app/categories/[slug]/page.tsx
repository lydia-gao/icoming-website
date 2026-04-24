import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";

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
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.shortDescription,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = getProductsByCategory(slug);

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-400">
            <Link href="/products" className="hover:text-ink-900">
              Products
            </Link>{" "}
            / <span className="text-ink-800">{category.name}</span>
          </nav>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-ink-900 sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-600">
            {category.longDescription ?? category.shortDescription}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-content">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-100 bg-white p-10 text-center">
              <p className="text-ink-600">
                We&apos;re uploading products for this category. Reach out for
                samples and the full spec sheet.
              </p>
              <Link href="/contact" className="btn-primary mt-6">
                Request samples
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
