# Operational TODO — ICOMing web

Deferred operational/infra items that need business input or external
coordination rather than code. Owner: Lydia. Update as items complete.

## Open

### Verify Resend sending domain
**Priority:** blocks production go-live.
**Why:** the default `onboarding@resend.dev` sender can only deliver
to the email you registered Resend with, and even then has weak
deliverability reputation. Real RFQ notifications must come from a
verified domain you own.
**Steps:**
1. Decide on the sender — `rfq@i-coming.com` is the obvious choice;
   `noreply@i-coming.com` also works. A subdomain like
   `rfq.i-coming.com` lets you isolate transactional reputation from
   the main mail domain.
2. Resend dashboard → **Domains** → **Add Domain** → enter the choice.
3. Add the SPF, DKIM, and DMARC records Resend shows at your DNS
   provider (wherever `i-coming.com` is registered).
4. Wait for *Verified* status (5 min – 24 h).
5. Set `RESEND_FROM_EMAIL=ICOMing RFQ <rfq@i-coming.com>` in Vercel
   (Production + Preview environments) and local `.env.local`.
6. Submit a test inquiry; confirm the email now arrives at the real
   `sale2@i-coming.com` (not just at the Resend account owner).

### Separate preview vs production Supabase projects
**Priority:** before the preview URL is shared with stakeholders.
**Why:** Vercel preview deployments currently hit the same Supabase
project as production (if only one is configured). Test inquiries,
admin experiments, and staging work will mix with real sales leads.
**Steps:**
- [ ] Create a second Supabase project (e.g. `icoming-preview`).
- [ ] Apply all three migrations (`0001_initial_schema.sql`,
      `0002_storage_bucket.sql`, `0003_admin.sql`) to it.
- [ ] In Vercel → **Project → Settings → Environment Variables**,
      split env vars by environment: **Preview** uses the preview
      project's URL + keys; **Production** keeps the production ones.
- [ ] Seed the preview project's `admin_users` table with the same
      allowlist so login works identically.
- [ ] Consider pointing preview at a separate Resend sender (or
      disabling email on preview altogether by leaving `RESEND_API_KEY`
      unset — the graceful fallback skips email silently).

### Error monitoring
**Priority:** before handing the site off to the sales team.
**Why:** silent failures are the most expensive — a broken inquiry
submission that returns 500 but looks fine to the buyer is a lost
lead nobody noticed.
**Options (pick one):**
- **Vercel's built-in observability**: zero setup, included with the
  project. Surfaces 5xx errors, slow routes, and function errors.
  Good enough for V1.
- **Sentry** (<https://sentry.io>): richer error tracking with
  stack traces, user context, release tracking. Free tier covers low
  volume. Install via `@sentry/nextjs` — small config, 2–3 lines of
  code + a wizard.
- **Axiom / Better Stack / LogRocket**: fuller observability stacks
  if you outgrow Sentry.

**Recommended:** start with Vercel's built-in observability (zero
setup), add Sentry only if something slips through.

### SEO polish
**Priority:** after product content is finalised, before marketing push.
**Items:**
- [ ] `app/sitemap.ts` — generate dynamically from product/category
      slugs + static routes, both EN and ZH. Vercel will serve it at
      `/sitemap.xml`.
- [ ] `app/robots.ts` — allow crawl for `/`, `/zh/*`; disallow
      `/admin/*`, `/api/*`, `/auth/*`.
- [ ] Per-product / per-category **OpenGraph + Twitter card** images.
      Either static (one image reused per category) or generated with
      `next/og` from the product's primary image + name.
- [ ] Canonical tags — add `<link rel="canonical">` on each page so
      `?submitted=...` and other query variants don't dilute rankings.
- [ ] `hreflang` alternates between EN and ZH versions of the same
      page — improves Google's treatment of the bilingual site.
- [ ] Structured data (JSON-LD) on product pages — `Product` schema
      with price, availability, MOQ. Unlocks rich snippets.
- [ ] Favicon + app icons (currently just a basic `favicon.ico`;
      add 192×192 / 512×512 PNGs for Android home-screen install).

### Finalize production database configuration
**Priority:** before hand-off to sales / customer traffic.
**Why:** the preview Supabase project is fine for staging but a few
production settings should be locked down before real RFQ data lands.
**Steps:**
- [ ] Rotate the initial `sb_secret_` key if it was exposed during
      setup/debug; store fresh keys in Vercel env vars only.
- [ ] Confirm Supabase project **Region** matches where sales is
      (Tokyo or Singapore for Wenzhou-based team).
- [ ] Turn on **Point-in-Time Recovery** (paid tier) once RFQ volume
      justifies it, or at minimum schedule daily logical backups.
- [ ] Review **Authentication → Email templates** — once the Resend
      sending domain is verified, update the magic-link template to
      come from your domain rather than Supabase's default sender.
- [ ] Confirm the `inquiry-uploads` storage bucket is present in the
      production project (run `0002_storage_bucket.sql` there too).
- [ ] Replace the `LYDIA_EMAIL_TODO@example.com` placeholder row in
      `admin_users` with your real email (see `PHASE-4-ADMIN.md` §2).
- [ ] Set up a weekly dump of `inquiries` / `inquiry_items` /
      `inquiry_uploads` to offsite storage if compliance/audit
      requires it.

## Completed

(nothing yet)
