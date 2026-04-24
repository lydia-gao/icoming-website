# Phase 4 setup — Admin dashboard

One-time setup for the internal `/admin` dashboard (inquiry review,
status management, attachment download). Relies on Phase 1 (Supabase
+ Resend) already being wired.

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

## 3. Configure Supabase Auth redirect URLs

Magic-link emails point at our `/auth/callback` route. Supabase blocks
redirects to URLs not on its allowlist.

**Dashboard → Authentication → URL Configuration → Redirect URLs**,
add each environment's callback URL:

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=*
https://your-vercel-production-url.vercel.app/auth/callback
https://your-vercel-production-url.vercel.app/auth/callback?next=*
https://i-coming.com/auth/callback                    (if you wire a custom domain)
https://i-coming.com/auth/callback?next=*
```

Also under **Site URL**, set the production origin (e.g.
`https://your-vercel-production-url.vercel.app` or your custom domain).
This is what Supabase falls back to when no `emailRedirectTo` is set.

## 4. (Optional) Customise email templates

**Dashboard → Authentication → Email Templates → Magic Link**. The
default wording is fine for V1 — only worth customising once you've
verified a real sending domain (see `FUTURE-TODO.md`). Until then,
magic-link emails come from `noreply@mail.app.supabase.io`; tell admins
to whitelist that sender so it doesn't land in spam.

## 5. First sign-in

1. `npm run dev` (or deploy to Vercel).
2. Visit `/admin`. You'll be redirected to `/admin/login`.
3. Enter your allowlisted email (the one you seeded in step 2).
4. Check that email inbox. Click the magic link.
5. You land on `/admin/inquiries`. You should see every RFQ submitted
   on the site.

If the magic link bounces with `Unauthorized` on click, the redirect
URL isn't on Supabase's allowlist — go back to step 3.

If you land on `/admin/login` after clicking the magic link (stuck in
a redirect loop), the allowlist is fine but your email isn't in
`admin_users`. Add it, then re-request a magic link.

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
  row (good for offboarding — keeps audit trail).
- `role` is `admin` or `sales` today; both have the same access in V1.
  Future phases may differentiate (e.g. only `admin` edits the
  admin_users table through a UI).
- **All admins see all inquiries** in V1 — no per-assignee visibility
  filter. Worth revisiting once the team grows past ~5.
- The dashboard is English-only (internal tool, simpler).

## 8. Known limitations (to be addressed later)

- **No admin-side attachment preview** — click-to-download is the only
  action. Preview pane could be added but not urgent.
- **No bulk actions** on inquiries (e.g. bulk-assign, bulk-close).
- **No audit log beyond `updated_at` and `assigned_to` changes.** If
  compliance later requires a full trail, add an `inquiry_events` table.
- **No admin-managed product catalog** — products still live in
  `src/data/products.ts`. That's the Phase 5 scope.
- **No CSV / JSON export of inquiries** yet — add when sales asks.
