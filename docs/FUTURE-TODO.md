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

### Finalize production database configuration
**Priority:** before hand-off to sales / customer traffic.
**Why:** the preview Supabase project is fine for staging but a few
production settings should be locked down before real RFQ data lands.
**Steps:**
- [ ] Decide whether preview + production share one Supabase project
      or get separate projects (recommend: separate, so test
      submissions don't mix with real leads).
- [ ] Rotate the initial `sb_secret_` key if it was exposed during
      setup/debug; store fresh keys in Vercel env vars only.
- [ ] Confirm Supabase project **Region** matches where sales is
      (Tokyo or Singapore for Wenzhou-based team).
- [ ] Turn on **Point-in-Time Recovery** (paid tier) once RFQ volume
      justifies it, or at minimum schedule daily logical backups.
- [ ] Review **Authentication → Email templates** (Phase 4 admin
      login uses magic links; defaults are fine, but the sender and
      branding should match the verified domain).
- [ ] Confirm the `inquiry-uploads` storage bucket is present in the
      production project (run `0002_storage_bucket.sql` there too).
- [ ] Set up a weekly dump of `inquiries` / `inquiry_items` /
      `inquiry_uploads` to offsite storage if compliance/audit
      requires it.

## Completed

(nothing yet)
