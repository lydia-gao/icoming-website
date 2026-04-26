import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Restore a soft-deleted group by setting active=true.
 *
 * Cards under the group keep whatever active flag they had before the
 * group was deleted. Soft-deleting a group hides its cards from the
 * public site (RLS joins active groups), so restoring the group
 * naturally re-exposes any active cards underneath.
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

  const { data: group, error } = await supabase
    .from("cms_groups")
    .update({
      active: true,
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .eq("id", id)
    .select("id, section_key, title_en, title_zh, position, active")
    .single();

  if (error || !group) {
    console.error("[cms] restore group failed", error, { id });
    return NextResponse.json(
      { error: error?.message ?? "Could not restore group" },
      { status: 500 },
    );
  }

  const schema = findCardSectionSchema(group.section_key);
  if (schema) flushCmsCaches(schema.page);

  return NextResponse.json({ ok: true, group });
}
