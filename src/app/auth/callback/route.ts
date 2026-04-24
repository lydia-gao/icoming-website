import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Magic-link redirect target.
 *
 *   GET /auth/callback?code=xxx&next=/admin/inquiries
 *
 * Exchanges the OTP code for a session, sets the auth cookie, and
 * redirects to the `next` URL (defaults to /admin).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[auth] exchangeCodeForSession failed", error);
        return NextResponse.redirect(
          `${origin}/admin/login?error=${encodeURIComponent("Sign-in link is invalid or has expired. Request a new one.")}`,
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}${nextPath}`);
}
