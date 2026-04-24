import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SaveButton } from "@/components/SaveButton";
import { getCategoryBySlug } from "@/data/categories";
import {
  products,
  getProductBySlug,
  getProductsByCategory,
} from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

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
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);
  const related = getProductsByCategory(product.categorySlug)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);
  const image = product.images[0];

  const hasSpecs = product.specs.length > 0;
  const hasMoq = Boolean(product.moq);
  const hasLeadTime = Boolean(product.leadTime);

  return (
    <>
      <section className="py-10 md:py-14">
        <div className="container-content">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-400">
            <Link href="/products" className="hover:text-ink-900">
              Products
            </Link>
            {category && (
              <>
                {" / "}
                <Link
                  href={`/categories/${category.slug}`}
                  className="hover:text-ink-900"
                >
                  {category.name}
                </Link>
              </>
            )}
            {" / "}
            <span className="text-ink-800">{product.name}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-sand-100 ring-1 ring-ink-100">
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            <div>
              {category && (
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-moss-700">
                  {category.name}
                </div>
              )}
              <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-ink-900 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-600">
                {product.summary}
              </p>
              <p className="mt-4 text-ink-600">{product.description}</p>

              {(hasMoq || hasLeadTime) && (
                <div className="mt-8 grid gap-2 rounded-2xl bg-sand-100/60 p-5 text-sm">
                  {hasMoq && (
                    <div className="flex justify-between">
                      <span className="text-ink-400">MOQ</span>
                      <span className="font-medium text-ink-900">{product.moq}</span>
                    </div>
                  )}
                  {hasLeadTime && (
                    <div className="flex justify-between">
                      <span className="text-ink-400">Lead time</span>
                      <span className="font-medium text-ink-900">{product.leadTime}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <SaveButton
                  slug={product.slug}
                  name={product.name}
                  image={image}
                  variant="full"
                />
                <Link href="/inquiry" className="btn-secondary">
                  View inquiry basket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs + customization */}
      <section className="py-8 md:py-12">
        <div className="container-content grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-ink-900">Specifications</h2>
            {hasSpecs ? (
              <dl className="mt-4 divide-y divide-ink-100 rounded-2xl bg-white ring-1 ring-ink-100">
                {product.specs.map((s) => (
                  <div
                    key={s.label}
                    className="grid grid-cols-3 gap-4 px-5 py-3 text-sm"
                  >
                    <dt className="text-ink-400">{s.label}</dt>
                    <dd className="col-span-2 text-ink-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-ink-100 bg-white p-6">
                <p className="text-sm text-ink-600">
                  Detailed specs (dimensions, material weight, handle length,
                  printing area) are confirmed per order. Reach out with your
                  target quantity and we&apos;ll send a full spec sheet tailored
                  to your brief.
                </p>
              </div>
            )}
          </div>

          <div>
            {product.customization && product.customization.length > 0 && (
              <>
                <h2 className="font-serif text-2xl text-ink-900">Customization options</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.customization.map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-moss-100 px-3 py-1 text-sm text-moss-800"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {product.materials && product.materials.length > 0 && (
              <>
                <h3 className="mt-8 font-serif text-lg text-ink-900">
                  Available materials
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.materials.map((m) => (
                    <li
                      key={m}
                      className="rounded-full bg-sand-100 px-3 py-1 text-sm text-ink-800"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-10 rounded-2xl bg-ink-900 p-6 text-ink-100">
              <div className="font-serif text-lg text-white">Need a custom quote?</div>
              <p className="mt-2 text-sm text-ink-100/75">
                Share quantity, target market, and any custom requirements.
                We&apos;ll come back within one business day with pricing and
                a sample plan.
              </p>
              <Link href="/contact" className="btn-primary mt-5">
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-content">
            <h2 className="font-serif text-2xl text-ink-900">Related products</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
