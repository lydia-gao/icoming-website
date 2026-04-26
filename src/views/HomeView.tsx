import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/Marquee";
import { EditorialDuo } from "@/components/EditorialDuo";
import { Placeholder } from "@/components/Placeholder";
import { getLocalizedCategories } from "@/data/categories";
import { getFeaturedProducts } from "@/data/products";
import { homeContent, marqueeTiles } from "@/content/home";
import { uiContent } from "@/content/ui";
import { isPlaceholder } from "@/content/_types";
import { loadCmsSection, pickField } from "@/lib/cms";
import { localePath, type Locale } from "@/lib/i18n";

export async function HomeView({ locale }: { locale: Locale }) {
  const featured = getFeaturedProducts(4, locale);
  const featuredCategories = getLocalizedCategories(locale).slice(0, 8);
  const { hero: staticHero, heroMetrics, sections } = homeContent[locale];
  const heroCms = await loadCmsSection("home.hero");
  const hero = {
    eyebrow:
      pickField(heroCms?.fields, "eyebrow", locale) ?? staticHero.eyebrow,
    headline:
      pickField(heroCms?.fields, "headline", locale) ?? staticHero.headline,
    subheadline:
      pickField(heroCms?.fields, "subheadline", locale) ??
      staticHero.subheadline,
    primaryCta: staticHero.primaryCta,
    secondaryCta: staticHero.secondaryCta,
  };
  const tiles = marqueeTiles[locale];
  const ui = uiContent[locale].home;

  const resolveHref = (href: string) => localePath(locale, href);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-gradient-to-b from-sand-100 to-sand-50">
        <div className="container-content grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-12 md:py-24 lg:gap-16">
          <div className="min-w-0 md:col-span-5">
            <div className="eyebrow">{hero.eyebrow}</div>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.5rem]">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              {hero.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={resolveHref(hero.primaryCta.href)} className="btn-primary">
                {hero.primaryCta.label}
              </Link>
              <Link href={resolveHref(hero.secondaryCta.href)} className="btn-secondary">
                {hero.secondaryCta.label}
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
              {heroMetrics.map((m, i) => {
                if (isPlaceholder(m)) {
                  return (
                    <div key={i}>
                      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-400">
                        {m.label}
                      </dt>
                      <dd className="mt-1.5">
                        <Placeholder placeholder={m} locale={locale} size="inline" />
                      </dd>
                    </div>
                  );
                }
                return (
                  <div key={i}>
                    <dt className="text-xs font-medium uppercase tracking-[0.14em] text-ink-400">
                      {m.label}
                    </dt>
                    <dd className="mt-1 font-serif text-2xl font-semibold text-ink-900">
                      {m.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="min-w-0 md:col-span-7">
            <Marquee tiles={tiles} rows={3} speedSeconds={70} />
            <p className="mt-3 text-center text-xs text-ink-400">
              {ui.marqueeCaption}
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16 sm:py-24">
        <div className="container-content">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">{sections.categories.eyebrow}</div>
              <h2 className="section-heading mt-2">{sections.categories.heading}</h2>
              <p className="mt-3 max-w-2xl text-ink-600">{sections.categories.body}</p>
            </div>
            <Link href={resolveHref("/products")} className="btn-ghost">
              {ui.viewAllProducts}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredCategories.map((c) => (
              <CategoryCard key={c.slug} category={c} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL DUO */}
      <EditorialDuo
        eyebrow={sections.editorial.eyebrow}
        heading={sections.editorial.heading}
        body={sections.editorial.body}
        left={sections.editorial.left}
        right={sections.editorial.right}
      />

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="bg-ink-50/60 py-16 sm:py-24">
          <div className="container-content">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="eyebrow">{sections.featured.eyebrow}</div>
                <h2 className="section-heading mt-2">{sections.featured.heading}</h2>
                <p className="mt-3 max-w-2xl text-ink-600">{sections.featured.body}</p>
              </div>
              <Link href={resolveHref("/products")} className="btn-ghost">
                {ui.browseAll}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.slug} product={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      <section className="bg-moss-800 py-16 text-ink-100 sm:py-24">
        <div className="container-content">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-300">
              {sections.process.eyebrow}
            </div>
            <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-white sm:text-4xl">
              {sections.process.heading}
            </h2>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sections.process.steps.map((p) => (
              <li key={p.step} className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
                <div className="font-serif text-3xl font-semibold text-moss-300">{p.step}</div>
                <div className="mt-3 text-base font-semibold text-white">{p.title}</div>
                <p className="mt-2 text-sm text-ink-100/75">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24">
        <div className="container-content">
          <div className="rounded-3xl bg-ink-900 p-10 text-center text-ink-100 sm:p-16">
            <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
              {sections.finalCta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-100/70">
              {sections.finalCta.body}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={resolveHref(sections.finalCta.primary.href)} className="btn-primary">
                {sections.finalCta.primary.label}
              </Link>
              <Link href={resolveHref(sections.finalCta.secondary.href)} className="btn-secondary">
                {sections.finalCta.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
