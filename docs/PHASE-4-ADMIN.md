# Phase 4 setup — Admin dashboard

One-time setup for the internal `/admin` dashboard (inquiry review,
status management, attachment download). Relies on Phase 1 (Supabase
+ Resend) already being wired.

> **V1 auth = email + password.** Magic-link was the original plan but
> the built-in Supabase email service has tight per-project rate
> limits that aren't reliable enough for a small sales team's daily
> sign-ins. Revisit magic link (or a passwordless alternative) once
> custom SMTP / a verified domain is configured.

---

## 1. Apply the admin migration

In the Supabase SQL editor, run
[`supabase/migrations/0003_admin.sql`](../supabase/migrations/0003_admin.sql).

It creates:
- `admin_users` allowlist table
- `is_admin()` security-definer function
- RLS policies giving authenticated admins SELECT/UPDATE access on
  `inquiries`, SELECT on `inquiry_items` + `inquiry_uploads`, plus
  read/write on `admin_users` itself.
- A seed row for `sale2@i-coming.com` + a placeholder for your
  personal email.

Verify in **Table Editor** → `admin_users` that both rows are there.

## 2. Replace the Lydia-email placeholder

The migration seeded a placeholder row with email
`LYDIA_EMAIL_TODO@example.com`. In the SQL editor, run:

```sql
update public.admin_users
   set email = 'your.real.email@example.com'
 where email = 'LYDIA_EMAIL_TODO@example.com';
```

Or delete the placeholder and insert fresh:

```sql
delete from public.admin_users where email = 'LYDIA_EMAIL_TODO@example.com';
insert into public.admin_users (email, full_name, role)
values ('your.real.email@example.com', 'Lydia Gao', 'admin');
```

To add more sales / admin users later, the same pattern works from the
SQL editor, or use the Supabase **Table Editor → admin_users → Insert row**.

`admin_users.email` is matched case-insensitively, so casing doesn't
matter — but keep it consistent with what you'll create in Supabase
Auth in the next step.

## 3. Provision auth accounts (no email needed)

Each person in `admin_users` also needs a Supabase Auth user with a
password. Two ways, both bypass the email rate limiter:

### Option A — Dashboard (recommended for first setup)

**Authentication → Users → Add user → Create new user.**

- Email: same address as the `admin_users` row (case doesn't matter
  for sign-in, but lower-case is cleanest).
- Password: pick a strong one and share with the salesperson via a
  secure channel (1Password, Signal, etc).
- Leave **Auto Confirm User** checked so they don't need to verify
  the email.

No email is sent.

### Option B — local CLI script (recommended for resets)

```bash
node --env-file=.env.local scripts/set-admin-password.mjs <email> [newpassword]
```

- If the auth user doesn't exist, it's created (auto-confirmed).
- If they exist, the password is updated in place.
- If `[newpassword]` is omitted, a secure random one is generated and
  printed to your terminal.

Uses `SUPABASE_SECRET_KEY` — dev machine only, never deploy.

## 4. (Optional) Configure Supabase Auth redirect URLs

Only required if/when you turn on email-based flows (password reset,
magic link, email confirmation). The email + password login itself
doesn't need redirect URLs configured.

When you do enable them, allowlist the `/auth/callback` route:

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=*
https://your-vercel-production-url.vercel.app/auth/callback
https://your-vercel-production-url.vercel.app/auth/callback?next=*
https://i-coming.com/auth/callback                    (custom domain)
https://i-coming.com/auth/callback?next=*
```

…via **Dashboard → Authentication → URL Configuration → Redirect URLs**.

## 5. First sign-in

1. `npm run dev` (or deploy to Vercel).
2. Visit `/admin`. You'll be redirected to `/admin/login`.
3. Enter the email + password you provisioned in step 3.
4. You land on `/admin/inquiries`. You should see every RFQ submitted
   on the site.

If sign-in fails with "Email or password is incorrect", reset the
password with the script in step 3. If sign-in succeeds but you bounce
back to `/admin/login`, the email isn't in `admin_users` (or
`active = false`).

## 6. What admins can do

Once signed in:

- **Inquiries list** (`/admin/inquiries`): paginated, sortable (date),
  filterable by status, and searchable across name / company /
  email / request ID. Click a row for full detail.
- **Inquiry detail** (`/admin/inquiries/[id]`):
  - Full contact block.
  - Every line item with its variant chips, quantity, tier snapshot,
    buyer notes.
  - Attachment list per item — click a filename to download (a fresh
    1-hour signed URL is generated on each click, no stale links).
  - Right-column editor: status dropdown, assignee dropdown (populated
    from `admin_users`), internal notes. **Save changes** writes to
    Supabase; the page refreshes to reflect the new state.
- **Sign out** button in the header (clears the Supabase session
  cookie and sends you back to `/admin/login`).

## 7. Permissions recap

- `admin_users.active = false` locks an admin out without deleting the
  row (good for offboarding — keeps audit trail). The auth user
  itself stays, so flipping the flag back restores access without a
  password reset.
- `role` is `admin` or `sales` today; both have the same access in V1.
  Future phases may differentiate (e.g. only `admin` edits the
  admin_users table through a UI).
- **All admins see all inquiries** in V1 — no per-assignee visibility
  filter. Worth revisiting once the team grows past ~5.
- The dashboard is English-only (internal tool, simpler).

## 8. Known limitations (to be addressed later)

- **No user-facing password reset.** Resets go through Lydia + the
  CLI script in §3. Once a verified email-sending domain is set up,
  enable `auth.resetPasswordForEmail` and add a "forgot password" link
  to the login form.
- **No 2FA / MFA.** Acceptable for the small allowlisted team; revisit
  when scale or threat model warrants it (Supabase MFA is supported).
- **No admin-side attachment preview** — click-to-download is the only
  action.
- **No bulk actions** on inquiries (e.g. bulk-assign, bulk-close).
- **No audit log beyond `updated_at` and `assigned_to` changes.** If
  compliance later requires a full trail, add an `inquiry_events` table.
- **No admin-managed product catalog** — products still live in
  `src/data/products.ts`. That's the Phase 5 scope.
- **No CSV / JSON export of inquiries** yet — add when sales asks.
