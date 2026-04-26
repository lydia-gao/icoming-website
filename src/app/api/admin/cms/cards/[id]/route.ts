import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Per-card edit + soft-delete.
 *
 * PATCH applies a partial update — only the keys present in the body
 * are touched, so callers can save subsets of fields without
 * round-tripping the full record.
 *
 * DELETE sets active=false (soft delete). Hard delete must happen via
 * the Supabase dashboard until the admin "show deleted" UI lands.
 */

type PatchBody = {
  title_en?: unknown;
  title_zh?: unknown;
  description_en?: unknown;
  description_zh?: unknown;
  image_path?: unknown;
  image_alt_en?: unknown;
  image_alt_zh?: unknown;
  meta?: unknown;
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

  const updates: Record<string, unknown> = {};
  if ("title_en" in body) updates.title_en = trimOrNull(body.title_en);
  if ("title_zh" in body) updates.title_zh = trimOrNull(body.title_zh);
  if ("description_en" in body)
    updates.description_en = trimOrNull(body.description_en);
  if ("description_zh" in body)
    updates.description_zh = trimOrNull(body.description_zh);
  if ("image_path" in body) updates.image_path = trimOrNull(body.image_path);
  if ("image_alt_en" in body)
    updates.image_alt_en = trimOrNull(body.image_alt_en);
  if ("image_alt_zh" in body)
    updates.image_alt_zh = trimOrNull(body.image_alt_zh);
  if ("meta" in body) {
    if (
      body.meta &&
      typeof body.meta === "object" &&
      !Array.isArray(body.meta)
    ) {
      updates.meta = body.meta;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();
  updates.updated_by = admin.user_id;

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const { data: card, error } = await supabase
    .from("cms_cards")
    .update(updates)
    .eq("id", id)
    .select("*, cms_groups!inner(section_key)")
    .single();

  if (error || !card) {
    console.error("[cms] update card failed", error, { id });
    return NextResponse.json(
      { error: error?.message ?? "Could not update card" },
      { status: 500 },
    );
  }

  const sectionKey =
    (card.cms_groups as unknown as { section_key: string } | null)?.section_key ?? null;
  if (sectionKey) {
    const schema = findCardSectionSchema(sectionKey);
    if (schema) flushCmsCaches(schema.page);
  }

  // Strip the joined group out of the returned payload — the client
  // only cares about the card itself.
  const { cms_groups: _ignored, ...rest } = card as Record<string, unknown>;
  return NextResponse.json({ ok: true, card: rest });
}

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

  const { data: card, error } = await supabase
    .from("cms_cards")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .eq("id", id)
    .select("id, cms_groups!inner(section_key)")
    .single();

  if (error || !card) {
    console.error("[cms] soft-delete card failed", error, { id });
    return NextResponse.json(
      { error: error?.message ?? "Could not delete card" },
      { status: 500 },
    );
  }

  const sectionKey =
    (card.cms_groups as unknown as { section_key: string } | null)?.section_key ?? null;
  if (sectionKey) {
    const schema = findCardSectionSchema(sectionKey);
    if (schema) flushCmsCaches(schema.page);
  }

  return NextResponse.json({ ok: true });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
