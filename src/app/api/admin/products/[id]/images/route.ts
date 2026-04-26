import { NextResponse } from "next/server";
import {
  flushProductCaches,
  flushProductDetailCache,
} from "@/lib/products-revalidate";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * PUT — atomic replace of a product's image set.
 *
 * The client builds the desired image list (order, primary, alt text,
 * plus any newly uploaded paths) and posts the full set. Server
 * deletes existing rows for this product and inserts the new set,
 * with positions reflecting array order.
 *
 * The unique partial index on (product_id) WHERE is_primary forbids
 * two primaries; we delete first to avoid transient violations.
 *
 * storage_path accepts both bare bucket keys (e.g. "abc.jpg") and
 * leading-slash local paths (e.g. "/images/products/foo.jpg") — the
 * latter is what migrated static products carry until sales replaces
 * them with new uploads. cmsImageUrl resolves both.
 */

type ImageInput = {
  storage_path: string;
  alt_en: string | null;
  alt_zh: string | null;
  is_primary: boolean;
};

type Body = {
  images?: unknown;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.images)) {
    return NextResponse.json(
      { error: "images must be an array." },
      { status: 400 },
    );
  }

  const cleaned: ImageInput[] = [];
  let primaryCount = 0;
  for (const raw of body.images) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const path = trimOrNull(r.storage_path);
    if (!path) continue;
    const isPrimary = !!r.is_primary;
    if (isPrimary) primaryCount++;
    cleaned.push({
      storage_path: path,
      alt_en: trimOrNull(r.alt_en),
      alt_zh: trimOrNull(r.alt_zh),
      is_primary: isPrimary,
    });
  }

  if (primaryCount > 1) {
    return NextResponse.json(
      { error: "Only one image can be marked primary." },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const { data: product, error: lookupErr } = await supabase
    .from("products")
    .select("id, slug, category_slug")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Delete-then-insert. There's a brief window where the product has no
  // images if the insert fails, but the unique-index on is_primary needs
  // existing rows gone before we add a new primary. Acceptable for V1
  // admin — sales can re-upload on the rare insert failure.
  const { error: deleteErr } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", id);
  if (deleteErr) {
    console.error("[products] images delete failed", deleteErr, { id });
    return NextResponse.json(
      { error: deleteErr.message },
      { status: 500 },
    );
  }

  if (cleaned.length > 0) {
    const rows = cleaned.map((img, idx) => ({
      product_id: id,
      storage_path: img.storage_path,
      alt_en: img.alt_en,
      alt_zh: img.alt_zh,
      position: idx,
      is_primary: img.is_primary,
    }));
    const { error: insertErr } = await supabase
      .from("product_images")
      .insert(rows);
    if (insertErr) {
      console.error("[products] images insert failed", insertErr, { id });
      return NextResponse.json(
        { error: insertErr.message },
        { status: 500 },
      );
    }
  }

  // Bump the product timestamp so the list view's "Updated" column reflects
  // image edits, even though nothing on `products` itself changed.
  await supabase
    .from("products")
    .update({
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .eq("id", id);

  flushProductCaches(product.category_slug);
  flushProductDetailCache(product.slug);

  return NextResponse.json({ ok: true, count: cleaned.length });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
