import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Bulk reorder cards within a single group. The request body is the
 * full ordered list of card ids; each card's `position` is set to its
 * index in that list.
 *
 * The caller is expected to send only ids belonging to one group; we
 * verify this server-side so a malformed request can't accidentally
 * mix groups.
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

  // Verify all ids belong to the same group, and that the group exists.
  const { data: existingCards, error: lookupErr } = await supabase
    .from("cms_cards")
    .select("id, group_id, cms_groups!inner(section_key)")
    .in("id", ids);

  if (lookupErr || !existingCards) {
    return NextResponse.json(
      { error: lookupErr?.message ?? "Could not load cards" },
      { status: 500 },
    );
  }
  if (existingCards.length !== ids.length) {
    return NextResponse.json({ error: "Some ids not found" }, { status: 400 });
  }
  const groupIds = new Set(existingCards.map((c) => c.group_id));
  if (groupIds.size !== 1) {
    return NextResponse.json(
      { error: "All ids must belong to one group" },
      { status: 400 },
    );
  }

  const sectionKey =
    (existingCards[0].cms_groups as unknown as { section_key: string } | null)
      ?.section_key ?? null;

  // Apply each new position. We do this as N parallel updates rather
  // than a single SQL CASE — fewer to ship, and the volume here is
  // tiny (cards per gallery measured in dozens at most).
  const updatedAt = new Date().toISOString();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("cms_cards")
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
    console.error("[cms] reorder cards failed", failure.error);
    return NextResponse.json({ error: failure.error.message }, { status: 500 });
  }

  if (sectionKey) {
    const schema = findCardSectionSchema(sectionKey);
    if (schema) flushCmsCaches(schema.page);
  }

  return NextResponse.json({ ok: true });
}
