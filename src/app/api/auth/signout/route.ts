import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/admin/login`, { status: 303 });
}
