import { NextResponse } from "next/server";
import { flushCmsCaches } from "@/lib/cms-revalidate";
import { findSectionSchema } from "@/lib/cms-schemas";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

/**
 * Admin-only writes for singleton CMS sections.
 *
 *   PUT     upsert this section's `fields` JSONB
 *   DELETE  remove the row → public reads fall back to static defaults
 *
 * After every successful write we flush the `cms` cache tag and
 * revalidate the public paths that surface this section, so edits
 * propagate to the live site within the next request.
 */

type RawBilingual = { en?: unknown; zh?: unknown };

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { key } = await params;
  const schema = findSectionSchema(key);
  if (!schema) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  let body: { fields?: Record<string, unknown> };
  try {
    body = (await request.json()) as { fields?: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.fields || typeof body.fields !== "object") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cleaned: Record<string, unknown> = {};
  for (const field of schema.fields) {
    const raw = body.fields[field.key];
    if (raw === undefined) continue;

    if (field.type === "paragraphs") {
      if (!Array.isArray(raw)) continue;
      const out: Array<{ en: string | null; zh: string | null }> = [];
      for (const entry of raw) {
        if (!entry || typeof entry !== "object") continue;
        const r = entry as RawBilingual;
        const en = trimOrNull(r.en);
        const zh = trimOrNull(r.zh);
        if (en === null && zh === null) continue;
        out.push({ en, zh });
      }
      if (out.length > 0) cleaned[field.key] = out;
      continue;
    }

    // text / textarea
    if (Array.isArray(raw) || typeof raw !== "object") continue;
    const r = raw as RawBilingual;
    const en = trimOrNull(r.en);
    const zh = trimOrNull(r.zh);
    if (en === null && zh === null) continue;
    cleaned[field.key] = { en, zh };
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured on this server" },
      { status: 500 },
    );
  }

  // No content left after sanitizing → treat as reset.
  if (Object.keys(cleaned).length === 0) {
    const { error } = await supabase
      .from("cms_sections")
      .delete()
      .eq("section_key", key);
    if (error) {
      console.error("[cms] reset section failed", error, { key });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    flushCmsCaches(schema.page);
    return NextResponse.json({ ok: true, status: "default" });
  }

  const { error } = await supabase.from("cms_sections").upsert(
    {
      section_key: key,
      page: schema.page,
      fields: cleaned,
      updated_at: new Date().toISOString(),
      updated_by: admin.user_id,
    },
    { onConflict: "section_key" },
  );

  if (error) {
    console.error("[cms] upsert section failed", error, { key });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  flushCmsCaches(schema.page);
  return NextResponse.json({ ok: true, status: "customized" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const admin = await requireAdminRow();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { key } = await params;
  const schema = findSectionSchema(key);
  if (!schema) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured on this server" },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("cms_sections")
    .delete()
    .eq("section_key", key);

  if (error) {
    console.error("[cms] delete section failed", error, { key });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  flushCmsCaches(schema.page);
  return NextResponse.json({ ok: true });
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
