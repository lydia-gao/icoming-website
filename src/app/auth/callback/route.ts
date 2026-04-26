import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Email-link redirect target. Used for password recovery and email
 * confirmation flows; not used by the email+password login path.
 *
 *   GET /auth/callback?code=xxx&next=/admin/inquiries
 *
 * Exchanges the one-time code for a session, sets the auth cookie,
 * and redirects to `next` (defaults to /admin).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(
        "Sign-in link is missing its code. Request a new link.",
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(
        "Auth is not configured on this server.",
      )}`,
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth] exchangeCodeForSession failed", error);
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(
        "Sign-in link is invalid or has expired. Request a new one.",
      )}`,
    );
  }

  return NextResponse.redirect(`${origin}${nextPath}`);
}
