import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the secret (service-role) key.
 * Bypasses RLS — never import this from a client component.
 *
 * Accepts either of Supabase's key formats:
 *   - New: SUPABASE_SECRET_KEY              (sb_secret_...)
 *   - Legacy: SUPABASE_SERVICE_ROLE_KEY     (JWT eyJ...)
 *
 * Returns `null` if env vars are missing so local dev continues to work
 * without a Supabase project (the API route falls back to log-only mode).
 */
let cachedClient: SupabaseClient | null | undefined;

export function getServiceSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??        // new naming (preferred)
    process.env.SUPABASE_SERVICE_ROLE_KEY;    // legacy naming (still accepted)

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
