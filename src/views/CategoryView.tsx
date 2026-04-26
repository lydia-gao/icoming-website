import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryBySlug } from "@/data/categories";
import { uiContent } from "@/content/ui";
import { getProductsByCategoryPublic } from "@/lib/products-public";
import { localePath, type Locale } from "@/lib/i18n";

export async function CategoryView({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const category = getCategoryBySlug(slug, locale);
  if (!category) notFound();

  const items = await getProductsByCategoryPublic(slug, locale);
  const ui = uiContent[locale].categoryPage;

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-xs text-ink-400">
            <Link href={localePath(locale, "/products")} className="hover:text-ink-900">
              {ui.breadcrumbProducts}
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
              <p className="text-ink-600">{ui.emptyCategory}</p>
              <Link href={localePath(locale, "/contact")} className="btn-primary mt-6">
                {ui.requestSamples}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
