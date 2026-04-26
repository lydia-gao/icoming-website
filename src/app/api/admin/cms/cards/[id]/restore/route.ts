import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Restore a soft-deleted card by setting active=true.
 *
 * Cards are soft-deleted (active=false) by DELETE /cards/[id]. This
 * endpoint reverses that. Hard delete only happens via the Supabase
 * dashboard.
 */
export async function POST(
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
      active: true,
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .eq("id", id)
    .select(
      "id, group_id, title_en, title_zh, description_en, description_zh, image_path, image_alt_en, image_alt_zh, position, active, meta, cms_groups!inner(section_key)",
    )
    .single();

  if (error || !card) {
    console.error("[cms] restore card failed", error, { id });
    return NextResponse.json(
      { error: error?.message ?? "Could not restore card" },
      { status: 500 },
    );
  }

  const sectionKey =
    (card.cms_groups as unknown as { section_key: string } | null)
      ?.section_key ?? null;
  if (sectionKey) {
    const schema = findCardSectionSchema(sectionKey);
    if (schema) flushCmsCaches(schema.page);
  }

  const { cms_groups: _ignored, ...rest } = card as Record<string, unknown>;
  return NextResponse.json({ ok: true, card: rest });
}
