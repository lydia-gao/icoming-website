import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { requireAdminRow } from "@/lib/supabase-server";

const VALID_STATUSES = ["new", "in_progress", "quoted", "won", "lost"] as const;
type Status = (typeof VALID_STATUSES)[number];

type PatchBody = {
  status?: string;
  assigned_to?: string | null;
  internal_notes?: string | null;
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

  if (body.status !== undefined) {
    if (!(VALID_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    updates.status = body.status as Status;
  }

  if (body.assigned_to !== undefined) {
    if (body.assigned_to === null) {
      updates.assigned_to = null;
    } else if (typeof body.assigned_to === "string" && body.assigned_to.length > 0) {
      updates.assigned_to = body.assigned_to;
    } else {
      return NextResponse.json(
        { error: "assigned_to must be a uuid or null" },
        { status: 400 },
      );
    }
  }

  if (body.internal_notes !== undefined) {
    updates.internal_notes =
      typeof body.internal_notes === "string" && body.internal_notes.trim() !== ""
        ? body.internal_notes.trim()
        : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured on this server" },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("inquiries")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[admin] update inquiry failed", error, { id });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
