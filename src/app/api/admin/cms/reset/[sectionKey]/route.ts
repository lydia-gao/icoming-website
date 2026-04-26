import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { resetCardSection } from "@/lib/cms-seed";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Reset a card section to the current site defaults.
 *
 * Hard-deletes every group (and cascading cards) for the section,
 * then re-seeds from `getCardSectionStaticGroups`. Sections without
 * static defaults end up empty — the expected "factory/team gallery
 * starting point" after a reset.
 *
 * Distinct from soft delete: this is an explicit destructive action
 * intended to undo all customizations and start over from the
 * site's shipped defaults. There is no restore.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sectionKey: string }> },
) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { sectionKey } = await params;
  const schema = findCardSectionSchema(sectionKey);
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

  const result = await resetCardSection(supabase, sectionKey, admin.user_id);
  if (!result.ok) {
    console.error("[cms] reset failed", result.error, { sectionKey });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  flushCmsCaches(schema.page);
  return NextResponse.json({ ok: true, groupCount: result.groupCount });
}
