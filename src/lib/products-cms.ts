import { unstable_cache } from "next/cache";
import { getPublicSupabase } from "./supabase-public";
import type { Locale } from "./i18n";

/**
 * Product CMS read API used by public server components.
 *
 * Static products in src/data/products.ts remain the canonical default
 * during the migration window. These helpers read DB-backed published
 * products only; callers are expected to fall back to the static
 * catalog when the DB returns empty (handled in 6.F).
 *
 * Reads go through `unstable_cache` tagged with PRODUCTS_CACHE_TAG so an
 * admin save can flush the public cache via revalidateTag.
 */

export const PRODUCTS_CACHE_TAG = "products";

// ---------- Types matching the DB schema ----------

export type ProductStatus = "draft" | "published" | "archived";

/** Bilingual string used inside JSONB variant arrays. */
export type Bilingual = { en: string | null; zh: string | null };

export type ProductPriceTier = {
  min_qty: number;
  max_qty?: number;
  unit_price: string;
};

export type ProductColor = {
  name_en: string | null;
  name_zh: string | null;
  hex?: string | null;
};

export type ProductSpec = {
  label_en: string | null;
  label_zh: string | null;
  value_en: string | null;
  value_zh: string | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  category_slug: string;
  status: ProductStatus;

  name_en: string | null;
  name_zh: string | null;
  summary_en: string | null;
  summary_zh: string | null;
  description_en: string | null;
  description_zh: string | null;
  moq_en: string | null;
  moq_zh: string | null;
  lead_time_en: string | null;
  lead_time_zh: string | null;

  min_order_qty: number | null;
  currency: string;

  price_tiers: ProductPriceTier[];
  sizes: Bilingual[];
  colors: ProductColor[];
  materials: Bilingual[];
  customization: Bilingual[];
  specs: ProductSpec[];
  tags: Bilingual[];

  featured: boolean;
  position: number;

  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_en: string | null;
  alt_zh: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductWithImages = ProductRow & {
  images: ProductImageRow[];
};

// ---------- Locale accessors ----------

/** Pick locale-specific text from a paired _en / _zh column or a Bilingual.
 *  Returns null on whitespace-only — caller should fall back to static. */
export function pickProductText(
  en: string | null | undefined,
  zh: string | null | undefined,
  locale: Locale,
): string | null {
  const value = locale === "en" ? en : zh;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function pickBilingual(value: Bilingual, locale: Locale): string | null {
  return pickProductText(value.en, value.zh, locale);
}

/** Pick the primary image (is_primary=true) or the lowest-position fallback. */
export function pickPrimaryImage(
  images: ProductImageRow[],
): ProductImageRow | null {
  if (images.length === 0) return null;
  const primary = images.find((img) => img.is_primary);
  if (primary) return primary;
  return [...images].sort((a, b) => a.position - b.position)[0] ?? null;
}

// ---------- Uncached fetchers (server-only) ----------

const PRODUCT_COLUMNS =
  "id, slug, category_slug, status, name_en, name_zh, summary_en, summary_zh, description_en, description_zh, moq_en, moq_zh, lead_time_en, lead_time_zh, min_order_qty, currency, price_tiers, sizes, colors, materials, customization, specs, tags, featured, position, created_at, updated_at, created_by, updated_by";

const IMAGE_COLUMNS =
  "id, product_id, storage_path, alt_en, alt_zh, position, is_primary, created_at";

function normalizeProductRow(raw: unknown): ProductRow {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    slug: String(r.slug),
    category_slug: String(r.category_slug),
    status: r.status as ProductStatus,
    name_en: (r.name_en as string | null) ?? null,
    name_zh: (r.name_zh as string | null) ?? null,
    summary_en: (r.summary_en as string | null) ?? null,
    summary_zh: (r.summary_zh as string | null) ?? null,
    description_en: (r.description_en as string | null) ?? null,
    description_zh: (r.description_zh as string | null) ?? null,
    moq_en: (r.moq_en as string | null) ?? null,
    moq_zh: (r.moq_zh as string | null) ?? null,
    lead_time_en: (r.lead_time_en as string | null) ?? null,
    lead_time_zh: (r.lead_time_zh as string | null) ?? null,
    min_order_qty:
      typeof r.min_order_qty === "number" ? r.min_order_qty : null,
    currency: typeof r.currency === "string" ? r.currency : "$",
    price_tiers: Array.isArray(r.price_tiers)
      ? (r.price_tiers as ProductPriceTier[])
      : [],
    sizes: Array.isArray(r.sizes) ? (r.sizes as Bilingual[]) : [],
    colors: Array.isArray(r.colors) ? (r.colors as ProductColor[]) : [],
    materials: Array.isArray(r.materials) ? (r.materials as Bilingual[]) : [],
    customization: Array.isArray(r.customization)
      ? (r.customization as Bilingual[])
      : [],
    specs: Array.isArray(r.specs) ? (r.specs as ProductSpec[]) : [],
    tags: Array.isArray(r.tags) ? (r.tags as Bilingual[]) : [],
    featured: Boolean(r.featured),
    position: typeof r.position === "number" ? r.position : 0,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    created_by: (r.created_by as string | null) ?? null,
    updated_by: (r.updated_by as string | null) ?? null,
  };
}

async function fetchPublishedProducts(): Promise<ProductWithImages[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data: products, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "published")
    .order("position", { ascending: true });

  if (error || !products || products.length === 0) return [];

  const productIds = products.map((p) => (p as { id: string }).id);
  const { data: images } = await supabase
    .from("product_images")
    .select(IMAGE_COLUMNS)
    .in("product_id", productIds)
    .order("position", { ascending: true });

  const imagesByProduct = new Map<string, ProductImageRow[]>();
  for (const img of (images ?? []) as ProductImageRow[]) {
    const list = imagesByProduct.get(img.product_id) ?? [];
    list.push(img);
    imagesByProduct.set(img.product_id, list);
  }

  return products.map((raw) => {
    const product = normalizeProductRow(raw);
    return {
      ...product,
      images: imagesByProduct.get(product.id) ?? [],
    };
  });
}

async function fetchPublishedProductBySlug(
  slug: string,
): Promise<ProductWithImages | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data: product, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !product) return null;

  const normalized = normalizeProductRow(product);
  const { data: images } = await supabase
    .from("product_images")
    .select(IMAGE_COLUMNS)
    .eq("product_id", normalized.id)
    .order("position", { ascending: true });

  return {
    ...normalized,
    images: ((images ?? []) as ProductImageRow[]),
  };
}

// ---------- Cached public reads ----------

/**
 * Cached read of every published product (with images), ordered by
 * the admin-managed `position` field. Returns [] if the DB is empty
 * or unreachable — callers fall back to the static catalog.
 */
export const loadPublishedProducts = unstable_cache(
  fetchPublishedProducts,
  ["products-published"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 },
);

/**
 * Cached read of a single published product by slug. Returns null
 * when the slug isn't found or the product isn't published — callers
 * fall back to the static catalog so URLs migrated from the static
 * catalog don't break during the transition.
 */
export const loadPublishedProductBySlug = unstable_cache(
  fetchPublishedProductBySlug,
  ["products-by-slug"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 },
);
