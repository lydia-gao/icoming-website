import type { SupabaseClient } from "@supabase/supabase-js";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/data/types";

/**
 * One-shot migration: copy the static catalog into the products DB.
 *
 * Used by /api/admin/products/migrate. All seeded rows land as
 * `status='draft'` so nothing flips public until sales reviews and
 * publishes each product.
 *
 * Refuses to run if the DB already has any product rows (any status,
 * including archived) to avoid duplicating entries. Hard-deleting via
 * the Supabase dashboard is the escape hatch if a re-migration is
 * genuinely needed.
 *
 * Image paths from static (e.g. "/images/products/foo.jpg") are
 * copied verbatim into product_images.storage_path. The cmsImageUrl
 * helper passes leading-slash paths through unchanged so seeded
 * products keep their existing images without a file copy. Sales
 * replaces images one at a time via the image manager (6.E).
 */
export async function migrateStaticCatalog(
  supabase: SupabaseClient,
  userId: string | null,
): Promise<
  | { ok: true; productCount: number; imageCount: number }
  | { ok: false; error: string }
> {
  const { count, error: countErr } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  if (countErr) {
    return { ok: false, error: countErr.message };
  }
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error:
        "Database already has products. Migration only runs on an empty catalog — clear existing rows from the Supabase dashboard if you need to re-migrate.",
    };
  }

  const now = new Date().toISOString();
  let totalImages = 0;

  for (let i = 0; i < staticProducts.length; i++) {
    const p = staticProducts[i];
    const productRow = staticToDbProduct(p, i, now, userId);
    const { data: inserted, error: insertErr } = await supabase
      .from("products")
      .insert(productRow)
      .select("id")
      .single();

    if (insertErr || !inserted) {
      return {
        ok: false,
        error: insertErr?.message ?? `Could not insert ${p.slug}`,
      };
    }

    if (p.images.length > 0) {
      const altEn = p.name;
      const altZh = p.translations?.zh?.name ?? p.name;
      const imageRows = p.images.map((path, idx) => ({
        product_id: inserted.id,
        storage_path: path,
        alt_en: altEn,
        alt_zh: altZh,
        position: idx,
        is_primary: idx === 0,
      }));
      const { error: imgErr } = await supabase
        .from("product_images")
        .insert(imageRows);
      if (imgErr) {
        return {
          ok: false,
          error: `Inserted ${p.slug} but images failed: ${imgErr.message}`,
        };
      }
      totalImages += imageRows.length;
    }
  }

  return {
    ok: true,
    productCount: staticProducts.length,
    imageCount: totalImages,
  };
}

function staticToDbProduct(
  p: Product,
  position: number,
  now: string,
  userId: string | null,
): Record<string, unknown> {
  const zh = p.translations?.zh;

  return {
    slug: p.slug,
    category_slug: p.categorySlug,
    status: "draft",

    name_en: p.name,
    name_zh: zh?.name ?? null,
    summary_en: p.summary,
    summary_zh: zh?.summary ?? null,
    description_en: p.description,
    description_zh: zh?.description ?? null,
    moq_en: p.moq ?? null,
    moq_zh: zh?.moq ?? null,
    lead_time_en: p.leadTime ?? null,
    lead_time_zh: zh?.leadTime ?? null,

    min_order_qty: p.minOrderQty ?? null,
    currency: p.currency ?? "$",

    price_tiers: (p.priceRange ?? []).map((t) => ({
      min_qty: t.minQty,
      max_qty: t.maxQty ?? undefined,
      unit_price: t.unitPrice,
    })),
    sizes: zipBilingual(p.sizes, zh?.sizes),
    colors: (p.colors ?? []).map((c, ci) => ({
      name_en: c.name,
      name_zh: zh?.colors?.[ci]?.name ?? null,
      hex: c.hex ?? null,
    })),
    materials: zipBilingual(p.materials, zh?.materials),
    customization: zipBilingual(p.customization, zh?.customization),
    specs: (p.specs ?? []).map((s) => ({
      label_en: s.label,
      label_zh: null,
      value_en: s.value,
      value_zh: null,
    })),
    tags: [],

    featured: !!p.featured,
    position,

    updated_at: now,
    updated_by: userId,
  };
}

function zipBilingual(
  en: string[] | undefined,
  zh: string[] | undefined,
): { en: string | null; zh: string | null }[] {
  if (!en || en.length === 0) return [];
  return en.map((e, i) => ({
    en: e,
    zh: zh?.[i] ?? null,
  }));
}
