#!/usr/bin/env node
// ---------------------------------------------------------------------------
// set-admin-password.mjs
// ---------------------------------------------------------------------------
// Create an auth user with email+password, or reset an existing user's
// password — without sending any email (so it bypasses the Supabase email
// rate limit). Uses the service-role key, so this is dev-machine-only.
//
// Usage:
//   node --env-file=.env.local scripts/set-admin-password.mjs <email> [password]
//
// If [password] is omitted, a secure random one is generated and printed.
// After creating the auth user, remember to add the email to
// public.admin_users (active = true) so the /admin gate lets them in.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const args = process.argv.slice(2);
const email = args[0]?.trim().toLowerCase();
let password = args[1];

if (!email) {
  console.error(
    "Usage: node --env-file=.env.local scripts/set-admin-password.mjs <email> [password]\n" +
      "  If [password] is omitted, a secure random one is generated and printed.",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in env.\n" +
      "Run with --env-file=.env.local, or set them in your shell.",
  );
  process.exit(1);
}

if (!password) {
  password = randomBytes(12).toString("base64url");
  console.log(`Generated password: ${password}`);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  perPage: 1000,
});
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const existing = list.users.find((u) => u.email?.toLowerCase() === email);

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
  });
  if (error) {
    console.error("Failed to update password:", error.message);
    process.exit(1);
  }
  console.log(`Updated password for ${email} (id ${existing.id}).`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }
  console.log(`Created auth user ${email} (id ${data.user.id}).`);
}

console.log(
  "\nReminder: ensure the email is in public.admin_users with active = true.\n" +
    "  insert into public.admin_users (email, full_name, role)\n" +
    `  values ('${email}', '<name>', 'sales')\n` +
    "  on conflict (email) do nothing;",
);
