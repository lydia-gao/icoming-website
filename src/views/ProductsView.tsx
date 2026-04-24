import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getLocalizedCategories } from "@/data/categories";
import { getLocalizedProducts } from "@/data/products";
import { uiContent } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";

export function ProductsView({ locale }: { locale: Locale }) {
  const categories = getLocalizedCategories(locale);
  const products = getLocalizedProducts(locale);
  const ui = uiContent[locale].productsPage;

  const categoryChip = (
    <li>
      <Link
        className="inline-block whitespace-nowrap rounded-full bg-moss-700 px-3 py-1.5 text-xs font-semibold text-white"
        href={localePath(locale, "/products")}
      >
        {ui.all}
      </Link>
    </li>
  );

  return (
    <>
      <section className="border-b border-ink-100 bg-sand-100/60">
        <div className="container-content py-12 md:py-16">
          <div className="eyebrow">{ui.eyebrow}</div>
          <h1 className="section-heading mt-2">{ui.heading}</h1>
          <p className="mt-3 max-w-2xl text-ink-600">
            {ui.intro(products.length, categories.length)}
          </p>
        </div>
      </section>

      {/* Mobile: horizontal chip scroller. Hidden on lg+. */}
      <div className="border-b border-ink-100 bg-sand-50 lg:hidden">
        <nav
          aria-label={ui.sidebarHeading}
          className="container-content overflow-x-auto"
        >
          <ul className="flex items-center gap-2 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categoryChip}
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  className="inline-block whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-700 ring-1 ring-ink-100 hover:text-ink-900"
                  href={localePath(locale, `/categories/${c.slug}`)}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section className="py-10 md:py-12 lg:py-16">
        <div className="container-content grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Desktop sidebar — hidden on <lg */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
              {ui.sidebarHeading}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  className="block rounded-lg px-3 py-1.5 font-medium text-ink-900 hover:bg-sand-100"
                  href={localePath(locale, "/products")}
                >
                  {ui.all}
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    className="block rounded-lg px-3 py-1.5 text-ink-600 hover:bg-sand-100 hover:text-ink-900"
                    href={localePath(locale, `/categories/${c.slug}`)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
