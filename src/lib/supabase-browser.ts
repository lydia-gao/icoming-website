"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client using the publishable (anon) key.
 *
 * Uses `createBrowserClient` from `@supabase/ssr` (not the plain
 * `createClient` from supabase-js) so that:
 *   - Magic-link auth uses PKCE flow.
 *   - The PKCE code-verifier is stored in a cookie the server callback
 *     can read during `exchangeCodeForSession`.
 *   - The session cookies written here are the same cookies the server
 *     reads via `createServerClient`, so the auth state stays in sync
 *     across server / client boundaries.
 *
 * Returns `null` if env vars are missing so file uploads gracefully
 * skip in local dev without a configured Supabase project.
 *
 * Accepts either key naming:
 *   - New:    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (sb_publishable_...)
 *   - Legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY         (JWT eyJ...)
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

  cachedClient = createBrowserClient(url, key);
  return cachedClient;
}
