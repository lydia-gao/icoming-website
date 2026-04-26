import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cookies-aware Supabase client for server components, route handlers,
 * and server actions. Uses the publishable / anon key, so queries run
 * as the authenticated user (when there is a session) and RLS applies.
 *
 * Import only from server code. The returned client should be created
 * per-request — it reads cookies from the current Next.js request.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          for (const { name, value, options } of items) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // In Server Components that aren't Route Handlers, cookies() is
          // read-only — swallow the error and rely on the middleware to
          // refresh the session cookie on the next request.
        }
      },
    },
  });
}

/**
 * Convenience wrapper that checks whether the current request's
 * authenticated user's email is in the admin_users allowlist.
 * Returns the admin row or null.
 *
 * Uses `ilike` (case-insensitive) on the DB side so a mixed-case
 * value in admin_users.email matches the lower-cased auth email.
 * The companion SQL `is_admin()` function does `lower(au.email)`
 * on both sides — this query mirrors that behavior.
 */
export async function requireAdminRow(): Promise<{
  email: string;
  full_name: string | null;
  role: "sales" | "admin";
} | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("email, full_name, role, active")
    .ilike("email", user.email)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  return {
    email: data.email,
    full_name: data.full_name,
    role: data.role as "sales" | "admin",
  };
}
