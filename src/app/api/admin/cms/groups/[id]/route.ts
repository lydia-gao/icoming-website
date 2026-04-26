import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Update a group's title (PATCH) or soft-delete it (DELETE).
 *
 * Soft-deleting a group hides every card under it from the public
 * site (the read-RLS policy joins active groups). Cards aren't
 * separately deleted; restoring the group via dashboard brings
 * everything back.
 */

type PatchBody = {
  title_en?: unknown;
  title_zh?: unknown;
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

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // If both titles are being cleared, refuse — a group needs at least one
  // visible label so admins can find it later.
  if (
    "title_en" in updates &&
    "title_zh" in updates &&
    updates.title_en === null &&
    updates.title_zh === null
  ) {
    return NextResponse.json(
      { error: "Group needs a title in at least one language." },
      { status: 400 },
    );
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

  const { data: group, error } = await supabase
    .from("cms_groups")
    .update(updates)
    .eq("id", id)
    .select("id, section_key, title_en, title_zh, position, active")
    .single();

  if (error || !group) {
    console.error("[cms] update group failed", error, { id });
    return NextResponse.json(
      { error: error?.message ?? "Could not update group" },
      { status: 500 },
    );
  }

  const schema = findCardSectionSchema(group.section_key);
  if (schema) flushCmsCaches(schema.page);

  return NextResponse.json({ ok: true, group });
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

  const { data: group, error } = await supabase
    .from("cms_groups")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .eq("id", id)
    .select("id, section_key")
    .single();

  if (error || !group) {
    console.error("[cms] soft-delete group failed", error, { id });
    return NextResponse.json(
      { error: error?.message ?? "Could not delete group" },
      { status: 500 },
    );
  }

  const schema = findCardSectionSchema(group.section_key);
  if (schema) flushCmsCaches(schema.page);

  return NextResponse.json({ ok: true });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
