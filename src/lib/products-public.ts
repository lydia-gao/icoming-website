import type { Locale } from "./i18n";
import { cmsImageUrl } from "./cms";
import type { ColorOption, PriceTier, Product } from "@/data/types";
import {
  getFeaturedProducts as getStaticFeatured,
  getLocalizedProducts as getStaticLocalized,
  getProductBySlug as getStaticBySlug,
  getProductsByCategory as getStaticByCategory,
} from "@/data/products";
import {
  loadPublishedProductBySlug,
  loadPublishedProducts,
  type Bilingual,
  type ProductImageRow,
  type ProductWithImages,
} from "./products-cms";

/**
 * Public product reads. Each helper queries the CMS first, then falls
 * back to the static catalog scoped to the same surface:
 *
 *   - List page          → DB published catalog ?? static catalog.
 *   - Category page      → DB published in category ?? static in category.
 *   - Detail page (slug) → DB published by slug    ?? static by slug.
 *   - Featured grid      → DB published featured   ?? static featured.
 *
 * The per-surface fallback keeps the public site usable during the
 * migration window — cold DB shows the entire static catalog, and a
 * partial publish keeps unpublished categories rendered from static
 * until sales completes them. Once sales has published their entire
 * working set, static fallback effectively never fires.
 *
 * Image paths from the static catalog (e.g. "/images/products/foo.jpg")
 * are passed through cmsImageUrl unchanged; uploaded paths resolve to
 * the public Supabase URL. Same dual support as Phase 5.
 */

// ---------------------------------------------------------------------------
// DB → static `Product` shape
// ---------------------------------------------------------------------------

function pickWithFallback(
  en: string | null | undefined,
  zh: string | null | undefined,
  locale: Locale,
): string {
  const primary = locale === "en" ? en : zh;
  const secondary = locale === "en" ? zh : en;
  if (typeof primary === "string" && primary.trim()) return primary.trim();
  if (typeof secondary === "string" && secondary.trim()) return secondary.trim();
  return "";
}

function pickBilingualWithFallback(b: Bilingual, locale: Locale): string {
  return pickWithFallback(b.en, b.zh, locale);
}

function imagesToUrls(images: ProductImageRow[]): string[] {
  // Sort: primary first, then by position. Then map to URLs and drop
  // any that fail to resolve (missing path / unset env).
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.position - b.position;
  });
  return sorted
    .map((img) => cmsImageUrl(img.storage_path))
    .filter((url): url is string => !!url);
}

export function dbToProduct(p: ProductWithImages, locale: Locale): Product {
  return {
    slug: p.slug,
    name: pickWithFallback(p.name_en, p.name_zh, locale) || p.slug,
    categorySlug: p.category_slug,
    summary: pickWithFallback(p.summary_en, p.summary_zh, locale),
    description: pickWithFallback(p.description_en, p.description_zh, locale),
    images: imagesToUrls(p.images),
    specs: p.specs
      .map((s) => ({
        label: pickWithFallback(s.label_en, s.label_zh, locale),
        value: pickWithFallback(s.value_en, s.value_zh, locale),
      }))
      .filter((s) => s.label || s.value),
    moq: pickWithFallback(p.moq_en, p.moq_zh, locale) || undefined,
    minOrderQty: p.min_order_qty ?? undefined,
    leadTime:
      pickWithFallback(p.lead_time_en, p.lead_time_zh, locale) || undefined,
    priceRange: p.price_tiers.map(
      (t): PriceTier => ({
        minQty: t.min_qty,
        maxQty: t.max_qty,
        unitPrice: t.unit_price,
      }),
    ),
    currency: p.currency,
    sizes: p.sizes
      .map((b) => pickBilingualWithFallback(b, locale))
      .filter((s) => !!s),
    colors: p.colors
      .map(
        (c): ColorOption => ({
          name: pickWithFallback(c.name_en, c.name_zh, locale),
          hex: c.hex ?? undefined,
        }),
      )
      .filter((c) => c.name),
    customization: p.customization
      .map((b) => pickBilingualWithFallback(b, locale))
      .filter((s) => !!s),
    materials: p.materials
      .map((b) => pickBilingualWithFallback(b, locale))
      .filter((s) => !!s),
    featured: p.featured,
  };
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------

export async function getProductsForListPublic(
  locale: Locale,
): Promise<Product[]> {
  const dbPublished = await loadPublishedProducts();
  if (dbPublished.length > 0) {
    return dbPublished.map((p) => dbToProduct(p, locale));
  }
  return getStaticLocalized(locale);
}

export async function getProductsByCategoryPublic(
  categorySlug: string,
  locale: Locale,
): Promise<Product[]> {
  const dbPublished = await loadPublishedProducts();
  const inCategory = dbPublished.filter(
    (p) => p.category_slug === categorySlug,
  );
  if (inCategory.length > 0) {
    return inCategory.map((p) => dbToProduct(p, locale));
  }
  return getStaticByCategory(categorySlug, locale);
}

export async function getProductBySlugPublic(
  slug: string,
  locale: Locale,
): Promise<Product | undefined> {
  const dbProduct = await loadPublishedProductBySlug(slug);
  if (dbProduct) return dbToProduct(dbProduct, locale);
  return getStaticBySlug(slug, locale);
}

export async function getFeaturedProductsPublic(
  count: number,
  locale: Locale,
): Promise<Product[]> {
  const dbPublished = await loadPublishedProducts();
  const featured = dbPublished.filter((p) => p.featured);
  if (featured.length > 0) {
    return featured.slice(0, count).map((p) => dbToProduct(p, locale));
  }
  return getStaticFeatured(count, locale);
}
