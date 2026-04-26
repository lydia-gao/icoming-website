import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findCardSectionSchema } from "@/lib/cms-schemas";
import { seedCardSection } from "@/lib/cms-seed";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Manually seed static defaults into a card section.
 *
 * Refuses to run if the section already has any active groups —
 * card sections auto-seed on first admin visit (see
 * `/admin/content/cards/[key]/page.tsx`), so this endpoint mostly
 * exists as a backstop / scripting hook. To replace existing
 * content with defaults, call /api/admin/cms/reset/[sectionKey]
 * instead.
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

  const { data: existing } = await supabase
    .from("cms_groups")
    .select("id")
    .eq("section_key", sectionKey)
    .eq("active", true)
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json(
      {
        error:
          "This section already has content. Use Reset to default to replace it.",
      },
      { status: 400 },
    );
  }

  const result = await seedCardSection(supabase, sectionKey, admin.user_id);
  if (!result.ok) {
    console.error("[cms] seed failed", result.error, { sectionKey });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  flushCmsCaches(schema.page);
  return NextResponse.json({ ok: true, groupCount: result.groupCount });
}
