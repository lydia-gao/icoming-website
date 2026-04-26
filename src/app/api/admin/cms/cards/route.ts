import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Create a card. For single-group sections (allowGroupCRUD=false) the
 * caller may omit `group_id` and we look up or create the implicit
 * single group on the fly.
 */
type PostBody = {
  section_key?: string;
  group_id?: string;
  title_en?: unknown;
  title_zh?: unknown;
  description_en?: unknown;
  description_zh?: unknown;
  image_path?: unknown;
  image_alt_en?: unknown;
  image_alt_zh?: unknown;
  meta?: unknown;
};

export async function POST(request: Request) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
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

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  let groupId: string;
  if (typeof body.group_id === "string" && body.group_id) {
    const { data: g, error } = await supabase
      .from("cms_groups")
      .select("id, section_key, active")
      .eq("id", body.group_id)
      .maybeSingle();
    if (error || !g || g.section_key !== body.section_key || !g.active) {
      return NextResponse.json(
        { error: "Group not found in this section" },
        { status: 400 },
      );
    }
    groupId = g.id;
  } else if (!schema.allowGroupCRUD) {
    const resolved = await resolveSingleGroup(
      supabase,
      body.section_key,
      admin.user_id,
    );
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 500 });
    }
    groupId = resolved.id;
  } else {
    return NextResponse.json(
      { error: "group_id is required for this section" },
      { status: 400 },
    );
  }

  // Determine next position so new cards land at the end of the group.
  const { data: tail } = await supabase
    .from("cms_cards")
    .select("position")
    .eq("group_id", groupId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPosition =
    tail && tail.length > 0 && typeof tail[0].position === "number"
      ? tail[0].position + 1
      : 0;

  const insert = {
    group_id: groupId,
    title_en: trimOrNull(body.title_en),
    title_zh: trimOrNull(body.title_zh),
    description_en: trimOrNull(body.description_en),
    description_zh: trimOrNull(body.description_zh),
    image_path: trimOrNull(body.image_path),
    image_alt_en: trimOrNull(body.image_alt_en),
    image_alt_zh: trimOrNull(body.image_alt_zh),
    position: nextPosition,
    active: true,
    meta: sanitizeMeta(body.meta),
    updated_at: new Date().toISOString(),
    updated_by: admin.user_id,
  };

  const { data: card, error } = await supabase
    .from("cms_cards")
    .insert(insert)
    .select("*")
    .single();

  if (error || !card) {
    console.error("[cms] create card failed", error);
    return NextResponse.json(
      { error: error?.message ?? "Could not create card" },
      { status: 500 },
    );
  }

  flushCmsCaches(schema.page);
  return NextResponse.json({ ok: true, card });
}

async function resolveSingleGroup(
  supabase: ReturnType<typeof getServiceSupabase> & object,
  sectionKey: string,
  userId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("cms_groups")
    .select("id")
    .eq("section_key", sectionKey)
    .eq("active", true)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing?.id) return { ok: true, id: existing.id };

  const { data: created, error } = await supabase
    .from("cms_groups")
    .insert({
      section_key: sectionKey,
      title_en: null,
      title_zh: null,
      position: 0,
      active: true,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[cms] auto-create group failed", error, { sectionKey });
    return {
      ok: false,
      error: error?.message ?? "Could not create group",
    };
  }
  return { ok: true, id: created.id };
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function sanitizeMeta(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}
