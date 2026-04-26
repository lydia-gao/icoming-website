import { NextResponse } from "next/server";
import { categories } from "@/data/categories";
import { flushProductCaches } from "@/lib/products-revalidate";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Create a new product as a draft. Sales fills in the rest in the
 * edit form (6.C). The minimum required to create:
 *   - slug (URL-unique)
 *   - category_slug (must match a static category)
 *   - name in at least one language
 *
 * Status is forced to 'draft' so newly-created products never appear
 * publicly until sales explicitly publishes.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Body = {
  slug?: unknown;
  category_slug?: unknown;
  name_en?: unknown;
  name_zh?: unknown;
};

export async function POST(request: Request) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = trimOrNull(body.slug);
  if (!slug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      {
        error:
          "Slug must use lowercase letters, numbers, and dashes (e.g. cotton-tote-promo).",
      },
      { status: 400 },
    );
  }
  if (slug.length > 80) {
    return NextResponse.json(
      { error: "Slug must be 80 characters or fewer." },
      { status: 400 },
    );
  }

  const categorySlug = trimOrNull(body.category_slug);
  if (!categorySlug) {
    return NextResponse.json(
      { error: "Category is required." },
      { status: 400 },
    );
  }
  const validCategory = categories.some((c) => c.slug === categorySlug);
  if (!validCategory) {
    return NextResponse.json(
      { error: `Unknown category: ${categorySlug}` },
      { status: 400 },
    );
  }

  const nameEn = trimOrNull(body.name_en);
  const nameZh = trimOrNull(body.name_zh);
  if (!nameEn && !nameZh) {
    return NextResponse.json(
      { error: "Product needs a name in at least one language." },
      { status: 400 },
    );
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured on this server" },
      { status: 500 },
    );
  }

  const { data: tail } = await supabase
    .from("products")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition =
    tail && tail.length > 0 && typeof tail[0].position === "number"
      ? tail[0].position + 1
      : 0;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug,
      category_slug: categorySlug,
      status: "draft",
      name_en: nameEn,
      name_zh: nameZh,
      position: nextPosition,
      updated_at: new Date().toISOString(),
      created_by: admin.user_id,
      updated_by: admin.user_id,
    })
    .select("id, slug, status, category_slug")
    .single();

  if (error || !product) {
    if (error?.code === "23505") {
      return NextResponse.json(
        {
          error: `A product with slug "${slug}" already exists. Pick a different slug.`,
        },
        { status: 409 },
      );
    }
    console.error("[products] create failed", error);
    return NextResponse.json(
      { error: error?.message ?? "Could not create product" },
      { status: 500 },
    );
  }

  // New drafts don't render publicly so we don't need to flush product
  // caches yet — but flushing the catalog page reflects the new admin
  // count if you happen to be looking at it.
  flushProductCaches();
  return NextResponse.json({ ok: true, product });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
