import { NextResponse } from "next/server";
import { migrateStaticCatalog } from "@/lib/products-migrate";
import { flushProductCaches } from "@/lib/products-revalidate";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * One-shot bulk migration — copies the static product catalog into
 * the products DB as drafts. Refuses if any products already exist
 * to avoid duplicate inserts.
 *
 * Sales triggers this manually from /admin/products when the table
 * is empty. After migration, sales reviews each product, fixes
 * pricing/copy, uploads real images, and flips status → published.
 */
export async function POST() {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const result = await migrateStaticCatalog(supabase, admin.user_id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  flushProductCaches();
  return NextResponse.json({
    ok: true,
    productCount: result.productCount,
    imageCount: result.imageCount,
  });
}
