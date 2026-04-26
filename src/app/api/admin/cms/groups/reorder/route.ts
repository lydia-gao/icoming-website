import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Bulk reorder groups within a single card section.
 *
 * Mirrors /api/admin/cms/cards/reorder — request body is the full
 * ordered list of group ids; each group's position is set to its
 * index in that list. Server verifies all ids belong to one section.
 */
type Body = {
  ids?: unknown;
};

export async function PATCH(request: Request) {
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

  const ids = Array.isArray(body.ids)
    ? body.ids.filter((v): v is string => typeof v === "string" && v.length > 0)
    : null;
  if (!ids || ids.length === 0) {
    return NextResponse.json(
      { error: "ids must be a non-empty array" },
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

  const { data: existing, error: lookupErr } = await supabase
    .from("cms_groups")
    .select("id, section_key")
    .in("id", ids);

  if (lookupErr || !existing) {
    return NextResponse.json(
      { error: lookupErr?.message ?? "Could not load groups" },
      { status: 500 },
    );
  }
  if (existing.length !== ids.length) {
    return NextResponse.json({ error: "Some ids not found" }, { status: 400 });
  }
  const sections = new Set(existing.map((g) => g.section_key));
  if (sections.size !== 1) {
    return NextResponse.json(
      { error: "All ids must belong to one section" },
      { status: 400 },
    );
  }
  const sectionKey = existing[0].section_key;

  const updatedAt = new Date().toISOString();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("cms_groups")
        .update({
          position: index,
          updated_at: updatedAt,
          updated_by: admin.user_id,
        })
        .eq("id", id),
    ),
  );
  const failure = results.find((r) => r.error);
  if (failure?.error) {
    console.error("[cms] reorder groups failed", failure.error);
    return NextResponse.json({ error: failure.error.message }, { status: 500 });
  }

  const schema = findCardSectionSchema(sectionKey);
  if (schema) flushCmsCaches(schema.page);

  return NextResponse.json({ ok: true });
}
