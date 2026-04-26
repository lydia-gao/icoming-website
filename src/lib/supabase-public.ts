import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client using the publishable (anon) key, no session.
 *
 * Use for *server-side reads of publicly-readable data* — the marketing
 * site rendering CMS content, for example. RLS still applies; this
 * client just skips cookie/session lookups (faster than the cookies-aware
 * SSR client) and never holds an auth session.
 *
 * Distinct from:
 *  - getServiceSupabase()  → service-role; bypasses RLS; admin API only.
 *  - createSupabaseServerClient() → cookies-aware; runs as the signed-in
 *    user; needed when an admin's session is in play.
 *  - getBrowserSupabase()  → browser-only; for client components.
 *
 * Returns null if env vars are missing so local dev without a Supabase
 * project still renders the static fallback.
 */
let cachedClient: SupabaseClient | null | undefined;

export function getPublicSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
