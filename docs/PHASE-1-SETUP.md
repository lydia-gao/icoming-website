# Phase 1 setup — Supabase + Resend

One-time steps to wire the inquiry form to a real database and email
notifications. Do this once per environment (local dev, Vercel preview,
production).

**If you skip this**, the site still runs — the inquiry form will
submit, show a `LOCAL-DEV-…` request ID on success, and log the
payload server-side. No persistence, no email.

---

## 1. Supabase project

1. Sign in at <https://supabase.com> and click **New project**.
2. Organization: your personal org is fine.
3. Project name: e.g. `icoming-rfq`.
4. Database password: generate a strong one and save it to your
   password manager. (You'll rarely need it — Supabase gives you
   per-project API keys for app access.)
5. Region: pick the closest to your salespeople. For Wenzhou-based
   sales, `Tokyo (ap-northeast-1)` or `Singapore (ap-southeast-1)`.
6. Plan: **Free** is fine for V1. Upgrade if you hit the row limit
   (50k rows free) or the 7-day-log retention becomes a problem.

Project creation takes ~2 minutes.

## 2. Apply the database schema

1. In the Supabase dashboard, open **SQL** → **New query**.
2. Paste the contents of [`supabase/migrations/0001_initial_schema.sql`](../supabase/migrations/0001_initial_schema.sql).
3. Click **Run**. You should see `Success. No rows returned.`

Verify by navigating to **Table Editor** — you should now see
`inquiries`, `inquiry_items`, and `inquiry_uploads` tables.

If you later edit the migration (add columns, change policies), save
it as a new file (`0002_…`, `0003_…`) — never mutate a file already
applied to production.

## 3. Grab the Supabase API keys

**Dashboard → Project Settings → API Keys**. The dashboard now shows
Supabase's newer key format — copy these three values:

| Variable                                    | Source                            | Looks like              |
|---------------------------------------------|-----------------------------------|-------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`                  | *Project URL*                     | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`      | *Publishable key*                 | `sb_publishable_...`    |
| `SUPABASE_SECRET_KEY`                       | *Secret key* ⚠ server-only        | `sb_secret_...`         |

The **secret key** bypasses Row Level Security. **Never commit it,
never expose it to the browser, never prefix it with `NEXT_PUBLIC_`.**
The API route in `src/app/api/inquiry/route.ts` is the only place it
should be used.

> **Older project?** If your dashboard still only shows the legacy
> `anon` / `service_role` JWT keys (`eyJ...`), those work too. Set
> them as `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
> `SUPABASE_SERVICE_ROLE_KEY`; the code falls back to those names
> automatically. When you enable the new key model in that project,
> migrate to the `sb_publishable_...` / `sb_secret_...` variants.

## 4. Resend account

1. Sign up at <https://resend.com>. Free tier: 100 emails/day, 3 000/month.
2. **API Keys** → **Create API Key** → name it `icoming-web`, scope
   **Sending access**. Copy the key (starts with `re_...`).
3. For V1 you'll send from `onboarding@resend.dev` — no DNS setup
   needed. When you want a real sender address like
   `rfq@i-coming.com`:
   - **Domains** → **Add Domain** → enter `i-coming.com` (or a
     subdomain like `rfq.i-coming.com`).
   - Resend shows the SPF, DKIM, and optional DMARC records to add to
     your domain registrar (where i-coming.com is managed).
   - After the records propagate (5 min – 24 h), Resend marks the
     domain *Verified*. Then set `RESEND_FROM_EMAIL=ICOMing RFQ <rfq@i-coming.com>`.

## 5. Env vars

Create `.env.local` in the repo root (copy from `.env.example`):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxx

RESEND_API_KEY=re_xxxxxxxxxx
INQUIRY_TO_EMAIL=sale2@i-coming.com
# RESEND_FROM_EMAIL=ICOMing RFQ <rfq@i-coming.com>  # uncomment once verified
```

Restart the dev server so Next.js re-reads the env.

For **Vercel**: **Project → Settings → Environment Variables**, add
the same four (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`,
`RESEND_API_KEY`) for the **Production** environment (and **Preview**
if you want previews to hit the same DB — recommend a separate
Supabase project for preview if you're worried about mixing test
submissions).

## 6. Smoke test

1. `npm run dev`.
2. Open <http://localhost:3000/products>, save 1-2 products.
3. Go to **/inquiry**, fill in a fake name/email, pick WhatsApp as the
   preferred contact, submit.
4. Verify:
   - Success page shows a real `RFQ-2026-00001` style request ID (not
     `LOCAL-DEV-…`).
   - An email lands in the inbox of `INQUIRY_TO_EMAIL` (check spam on
     first send since `onboarding@resend.dev` hasn't built reputation
     with your mail provider yet).
   - Supabase dashboard → Table Editor → `inquiries` shows the row,
     and `inquiry_items` shows matching rows.
5. Click **Chat with us on WhatsApp** on the success page — it should
   open WhatsApp Web / app with a pre-filled message containing the
   request ID and the saved product names.

---

## Troubleshooting

**"Could not save inquiry" error in the browser**
Usually a bad secret key or an RLS policy blocking the insert.
Check the server logs for the Supabase error; if it mentions
`permission denied`, confirm the migration applied cleanly (the
policies are on the last page of `0001_initial_schema.sql`). If it
mentions `Invalid API key`, double-check that `SUPABASE_SECRET_KEY`
(or legacy `SUPABASE_SERVICE_ROLE_KEY`) matches the key shown in the
dashboard — it's easy to accidentally paste the publishable key.

**Success page shows `LOCAL-DEV-…` even after env vars are set**
The Next.js dev server only reads `.env.local` on startup. Restart it.

**Email not arriving**
1. Check Resend dashboard → **Logs** — if Resend rejected the send
   it'll show the reason.
2. Check spam. `onboarding@resend.dev` is shared and has middling
   deliverability; verify your own domain for reliable delivery.
3. If nothing shows in Resend at all, confirm `RESEND_API_KEY` is set
   in the environment the API route is running in (dev / Vercel) and
   restart.

**Two submissions got the same request ID**
Shouldn't happen — the sequence is Postgres-atomic. If it did,
someone seeded the sequence or re-ran the migration in a way that
reset it. Check with `select nextval('rfq_seq');` in Supabase SQL.
