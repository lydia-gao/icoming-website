import { NextResponse } from "next/server";
import { categories } from "@/data/categories";
import {
  flushProductCaches,
  flushProductDetailCache,
} from "@/lib/products-revalidate";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Per-product PATCH (basic fields + status) and DELETE (soft-archive).
 *
 * 6.B uses this for status changes and basic field tweaks. 6.C
 * extends the PATCH body to cover the full bilingual variant set
 * (price tiers, sizes, colors, materials, customization, specs,
 * tags). The schema is stable; only the route validation grows.
 *
 * Slug edit policy: a published product's slug is locked. To change
 * slugs sales must revert the status to draft first. This avoids
 * SEO breakage from accidental renames.
 */

const VALID_STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof VALID_STATUSES)[number];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PatchBody = {
  status?: unknown;
  slug?: unknown;
  category_slug?: unknown;
  featured?: unknown;
  name_en?: unknown;
  name_zh?: unknown;
  summary_en?: unknown;
  summary_zh?: unknown;
  description_en?: unknown;
  description_zh?: unknown;
  moq_en?: unknown;
  moq_zh?: unknown;
  lead_time_en?: unknown;
  lead_time_zh?: unknown;
  min_order_qty?: unknown;
  currency?: unknown;
  // JSONB variant arrays (6.D)
  price_tiers?: unknown;
  sizes?: unknown;
  colors?: unknown;
  materials?: unknown;
  customization?: unknown;
  specs?: unknown;
  tags?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  // Pull the existing product so we can enforce slug-lock + know the
  // category for cache invalidation.
  const { data: existing, error: lookupErr } = await supabase
    .from("products")
    .select("id, slug, status, category_slug")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if ("status" in body) {
    const s = body.status;
    if (typeof s !== "string" || !(VALID_STATUSES as readonly string[]).includes(s)) {
      return NextResponse.json(
        { error: "Status must be draft, published, or archived." },
        { status: 400 },
      );
    }
    updates.status = s as Status;
  }

  if ("slug" in body) {
    const slug = trimOrNull(body.slug);
    if (!slug) {
      return NextResponse.json({ error: "Slug cannot be empty." }, { status: 400 });
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
    if (slug !== existing.slug) {
      // Lock slug edits once a product has ever been published. Reverting to
      // draft is required first so sales is forced to think about SEO impact.
      if (existing.status === "published") {
        return NextResponse.json(
          {
            error:
              "Slug is locked while published. Move to draft first if you really need to rename.",
          },
          { status: 400 },
        );
      }
      updates.slug = slug;
    }
  }

  if ("category_slug" in body) {
    const cat = trimOrNull(body.category_slug);
    if (!cat || !categories.some((c) => c.slug === cat)) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 },
      );
    }
    updates.category_slug = cat;
  }

  if ("featured" in body) {
    updates.featured = Boolean(body.featured);
  }

  for (const key of [
    "name_en",
    "name_zh",
    "summary_en",
    "summary_zh",
    "description_en",
    "description_zh",
    "moq_en",
    "moq_zh",
    "lead_time_en",
    "lead_time_zh",
  ] as const) {
    if (key in body) {
      updates[key] = trimOrNull(body[key]);
    }
  }

  if ("min_order_qty" in body) {
    const v = body.min_order_qty;
    if (v === null || v === "") {
      updates.min_order_qty = null;
    } else if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
      updates.min_order_qty = Math.floor(v);
    } else {
      return NextResponse.json(
        { error: "min_order_qty must be a non-negative integer or null." },
        { status: 400 },
      );
    }
  }

  if ("currency" in body) {
    const c = trimOrNull(body.currency);
    if (!c || c.length > 4) {
      return NextResponse.json(
        { error: "Currency must be a short symbol (e.g. $)." },
        { status: 400 },
      );
    }
    updates.currency = c;
  }

  // ---- JSONB variant arrays (6.D) ----
  for (const key of ["sizes", "materials", "customization", "tags"] as const) {
    if (key in body) {
      updates[key] = sanitizeBilingualArray(body[key]);
    }
  }

  if ("colors" in body) {
    updates.colors = sanitizeColorsArray(body.colors);
  }

  if ("specs" in body) {
    updates.specs = sanitizeSpecsArray(body.specs);
  }

  if ("price_tiers" in body) {
    const result = sanitizePriceTiers(body.price_tiers);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    updates.price_tiers = result.tiers;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();
  updates.updated_by = admin.user_id;

  const { data: product, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("id, slug, status, category_slug, name_en, name_zh, featured")
    .single();

  if (error || !product) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "A product with that slug already exists." },
        { status: 409 },
      );
    }
    console.error("[products] update failed", error);
    return NextResponse.json(
      { error: error?.message ?? "Could not update product" },
      { status: 500 },
    );
  }

  flushProductCaches(product.category_slug);
  // The detail page is keyed by slug, so flush both old + new when slug changed.
  flushProductDetailCache(existing.slug);
  if (product.slug !== existing.slug) {
    flushProductDetailCache(product.slug);
  }

  return NextResponse.json({ ok: true, product });
}

/**
 * Soft-archive a product. Sets status='archived' so the product is
 * hidden from public catalogue (RLS filters on status='published')
 * while remaining recoverable. Hard delete only via the Supabase
 * dashboard.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const { data: product, error } = await supabase
    .from("products")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .eq("id", id)
    .select("id, slug, category_slug")
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: error?.message ?? "Could not archive product" },
      { status: 500 },
    );
  }

  flushProductCaches(product.category_slug);
  flushProductDetailCache(product.slug);

  return NextResponse.json({ ok: true });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function sanitizeBilingualArray(
  value: unknown,
): Array<{ en: string | null; zh: string | null }> {
  if (!Array.isArray(value)) return [];
  const out: Array<{ en: string | null; zh: string | null }> = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const en = trimOrNull(r.en);
    const zh = trimOrNull(r.zh);
    if (en === null && zh === null) continue;
    out.push({ en, zh });
  }
  return out;
}

function sanitizeColorsArray(
  value: unknown,
): Array<{ name_en: string | null; name_zh: string | null; hex: string | null }> {
  if (!Array.isArray(value)) return [];
  const out: Array<{
    name_en: string | null;
    name_zh: string | null;
    hex: string | null;
  }> = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const name_en = trimOrNull(r.name_en);
    const name_zh = trimOrNull(r.name_zh);
    if (name_en === null && name_zh === null) continue;
    let hex = trimOrNull(r.hex);
    if (hex && !/^#?[0-9a-fA-F]{3,8}$/.test(hex)) hex = null;
    if (hex && !hex.startsWith("#")) hex = `#${hex}`;
    out.push({ name_en, name_zh, hex });
  }
  return out;
}

function sanitizeSpecsArray(
  value: unknown,
): Array<{
  label_en: string | null;
  label_zh: string | null;
  value_en: string | null;
  value_zh: string | null;
}> {
  if (!Array.isArray(value)) return [];
  const out: Array<{
    label_en: string | null;
    label_zh: string | null;
    value_en: string | null;
    value_zh: string | null;
  }> = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const label_en = trimOrNull(r.label_en);
    const label_zh = trimOrNull(r.label_zh);
    const value_en = trimOrNull(r.value_en);
    const value_zh = trimOrNull(r.value_zh);
    const hasLabel = label_en !== null || label_zh !== null;
    const hasValue = value_en !== null || value_zh !== null;
    if (!hasLabel || !hasValue) continue;
    out.push({ label_en, label_zh, value_en, value_zh });
  }
  return out;
}

type PriceTierClean = {
  min_qty: number;
  max_qty?: number;
  unit_price: string;
};

function sanitizePriceTiers(
  value: unknown,
):
  | { ok: true; tiers: PriceTierClean[] }
  | { ok: false; error: string } {
  if (!Array.isArray(value)) {
    return { ok: true, tiers: [] };
  }
  const cleaned: PriceTierClean[] = [];
  for (let i = 0; i < value.length; i++) {
    const row = value[i];
    if (!row || typeof row !== "object") {
      return { ok: false, error: `Tier ${i + 1}: invalid row.` };
    }
    const r = row as Record<string, unknown>;

    const minRaw = r.min_qty;
    const min =
      typeof minRaw === "number"
        ? minRaw
        : typeof minRaw === "string" && minRaw.trim() !== ""
        ? Number(minRaw)
        : NaN;
    if (!Number.isFinite(min) || min < 0 || !Number.isInteger(min)) {
      return {
        ok: false,
        error: `Tier ${i + 1}: minimum quantity must be a non-negative whole number.`,
      };
    }

    const maxRaw = r.max_qty;
    let max: number | undefined;
    if (maxRaw === null || maxRaw === undefined || maxRaw === "") {
      max = undefined;
    } else {
      const m =
        typeof maxRaw === "number"
          ? maxRaw
          : typeof maxRaw === "string"
          ? Number(maxRaw)
          : NaN;
      if (!Number.isFinite(m) || m < min || !Number.isInteger(m)) {
        return {
          ok: false,
          error: `Tier ${i + 1}: maximum must be a whole number ≥ minimum (or blank for the final "and up" tier).`,
        };
      }
      max = m;
    }

    const unitPrice = trimOrNull(r.unit_price);
    if (!unitPrice) {
      return {
        ok: false,
        error: `Tier ${i + 1}: unit price cannot be empty.`,
      };
    }

    cleaned.push({
      min_qty: min,
      max_qty: max,
      unit_price: unitPrice,
    });
  }

  if (cleaned.length === 0) return { ok: true, tiers: [] };

  // Sort by min_qty ascending.
  cleaned.sort((a, b) => a.min_qty - b.min_qty);

  // Only the last (highest min_qty) tier may have an undefined max_qty.
  for (let i = 0; i < cleaned.length - 1; i++) {
    if (cleaned[i].max_qty === undefined) {
      return {
        ok: false,
        error: `Only the final tier (highest minimum quantity) can leave the maximum blank as "and up".`,
      };
    }
  }

  // No overlapping ranges.
  for (let i = 0; i < cleaned.length - 1; i++) {
    const a = cleaned[i];
    const b = cleaned[i + 1];
    if (a.max_qty !== undefined && a.max_qty >= b.min_qty) {
      return {
        ok: false,
        error: `Tiers overlap: range ${a.min_qty}-${a.max_qty} runs into ${b.min_qty}+. Adjust the boundaries so each quantity belongs to exactly one tier.`,
      };
    }
  }

  return { ok: true, tiers: cleaned };
}
