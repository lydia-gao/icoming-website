"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using the publishable (anon) key.
 * Safe to import from client components. Reads env at first-call time.
 *
 * Accepts either key naming:
 *   - New:    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (sb_publishable_...)
 *   - Legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY         (JWT eyJ...)
 *
 * Returns `null` if env vars are missing so file uploads gracefully
 * skip in local dev without a configured Supabase project.
 */
let cachedClient: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
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
