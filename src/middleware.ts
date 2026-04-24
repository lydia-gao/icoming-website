import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh middleware.
 *
 * Supabase sessions live in HTTP-only cookies and need to be refreshed
 * on each request so they don't expire mid-session. This middleware
 * wraps every non-static request, reads the existing cookies, and
 * writes refreshed cookies on the outgoing response.
 *
 * It does NOT enforce auth — the /admin layout does that. This only
 * keeps the session alive.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without env, just pass through — the whole auth stack is off in
  // local dev and the middleware shouldn't block.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items) {
        for (const { name, value } of items) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of items) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Trigger a session refresh if applicable.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip static files, images, and the api/inquiry public endpoint.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/.*|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)",
  ],
};
