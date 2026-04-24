import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";
import { INQUIRY_UPLOADS_BUCKET } from "@/lib/uploads";

const DOWNLOAD_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Issues a fresh signed URL for an inquiry attachment and redirects the
 * browser to it. Admin-only. The URL is short-lived (1 hour) so stale
 * links can't leak — a refresh simply regenerates one.
 */
export async function GET(
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

  const { data: upload, error: lookupErr } = await supabase
    .from("inquiry_uploads")
    .select("storage_path, original_filename")
    .eq("id", id)
    .maybeSingle();

  if (lookupErr || !upload) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(INQUIRY_UPLOADS_BUCKET)
    .createSignedUrl(upload.storage_path, DOWNLOAD_TTL_SECONDS, {
      download: upload.original_filename ?? true,
    });

  if (signErr || !signed?.signedUrl) {
    console.error("[admin] signed URL generation failed", signErr, { id });
    return NextResponse.json(
      { error: signErr?.message ?? "Could not sign URL" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl, { status: 307 });
}
