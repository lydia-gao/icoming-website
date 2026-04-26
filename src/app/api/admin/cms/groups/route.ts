import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Create a group inside a card section.
 *
 * Single-group sections (allowGroupCRUD=false) shouldn't normally hit
 * this — the implicit single group is auto-created by POST /cards.
 * We still allow it here for completeness; the section schema gates
 * who can call it from the admin UI.
 */
type Body = {
  section_key?: unknown;
  title_en?: unknown;
  title_zh?: unknown;
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

  if (typeof body.section_key !== "string" || !body.section_key) {
    return NextResponse.json(
      { error: "section_key is required" },
      { status: 400 },
    );
  }
  const schema = findCardSectionSchema(body.section_key);
  if (!schema) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const titleEn = trimOrNull(body.title_en);
  const titleZh = trimOrNull(body.title_zh);
  if (titleEn === null && titleZh === null) {
    return NextResponse.json(
      { error: "Group needs a title in at least one language." },
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

  // Append at the end (max position + 1).
  const { data: tail } = await supabase
    .from("cms_groups")
    .select("position")
    .eq("section_key", body.section_key)
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition =
    tail && tail.length > 0 && typeof tail[0].position === "number"
      ? tail[0].position + 1
      : 0;

  const { data: group, error } = await supabase
    .from("cms_groups")
    .insert({
      section_key: body.section_key,
      title_en: titleEn,
      title_zh: titleZh,
      position: nextPosition,
      active: true,
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    })
    .select("id, section_key, title_en, title_zh, position, active")
    .single();

  if (error || !group) {
    console.error("[cms] create group failed", error);
    return NextResponse.json(
      { error: error?.message ?? "Could not create group" },
      { status: 500 },
    );
  }

  flushCmsCaches(schema.page);
  return NextResponse.json({ ok: true, group });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
