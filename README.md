# ICOMing website

Bilingual (English / 简体中文) B2B catalog + RFQ site for **Pingyang
ICom Bag Co., Ltd.** (平阳爱康箱包有限公司) — eco-friendly bag
manufacturer in Wenzhou, Zhejiang.

Buyers browse products → configure variants (size / color / material /
quantity) → add to an inquiry cart → submit an RFQ with optional file
attachments. The inquiry persists to Supabase, triggers an email to
sales with fresh download links, and gives the buyer a WhatsApp quick-
follow-up button. Sales manages inquiries from a password-authed
`/admin` dashboard.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind
CSS · Supabase (Postgres + Auth + Storage) · Resend · Vercel.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in Supabase + Resend keys
npm run dev
```

Open <http://localhost:3000>. English at `/`, Chinese at `/zh`,
admin at `/admin`.

Without `.env.local` the site still runs — inquiry submissions fall
back to log-only mode, admin is unreachable (no auth), and uploads
silently skip. See [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md)
and [`docs/PHASE-4-ADMIN.md`](docs/PHASE-4-ADMIN.md) for real setup.

## Scripts

| Command              | What it does                                     |
|----------------------|--------------------------------------------------|
| `npm run dev`        | Dev server with hot reload                       |
| `npm run build`      | Production build (pre-renders every static page) |
| `npm start`          | Serve the production build locally               |
| `npm run typecheck`  | `tsc --noEmit` — type-only validation            |
| `npm run lint`       | `next lint`                                      |

Before pushing, run `npm run typecheck && npm run build`.

## Project layout

```
src/
  app/
    layout.tsx                   root <html>/<body>, InquiryProvider
    (site)/                      English routes (no URL prefix)
      layout.tsx                 LocaleProvider="en" + Header + Footer
      page.tsx, about/, capabilities/, categories/[slug]/,
      contact/, inquiry/, products/, products/[slug]/, not-found.tsx
    zh/                          Chinese routes (URLs prefixed with /zh)
      layout.tsx                 LocaleProvider="zh" + Header + Footer
      (same page tree)
    admin/                       Internal admin dashboard (Phase 4)
      (auth)/login/              Magic-link sign-in
      (gated)/                   Auth-gated layout + chrome
        inquiries/               List + filter/sort/search
        inquiries/[id]/          Detail + editable status/assignee/notes
    api/
      inquiry/route.ts           Public POST for inquiry submissions
      admin/
        inquiry/[id]/route.ts    PATCH status/assignee/notes (admin)
        attachment/[id]/route.ts Fresh 1-hour signed URL for download
      auth/signout/route.ts      Clears Supabase session cookie
    auth/callback/route.ts       Magic-link code exchange target

  middleware.ts                  Refreshes Supabase session cookies

  views/                         One component per page; takes `locale` prop.
                                 EN + ZH route wrappers render the same view.
  components/                    Shared UI (Header, Footer, ProductCard,
                                 ProductGallery, ProductVariantsPanel, …)
  content/                       User-facing text. Each file exports
                                 Record<Locale, Shape>; TS enforces parity.
    ui.ts                        Nav, buttons, forms, metadata strings
    home.ts, about.ts, capabilities.ts, contact.ts, trust.ts
    _types.ts                    Placeholder<T> helper for unverified claims
  data/                          Structured data (products, categories, company).
                                 Non-English translations via optional
                                 `translations.zh` overlays.
  lib/
    i18n.ts                      Locale type, localePath, swapLocale
    locale-context.tsx           <LocaleProvider> + useLocale()
    inquiry-context.tsx          Saved-products cart (localStorage)
    supabase.ts                  Service-role client (server, RLS bypass)
    supabase-browser.ts          Publishable client (browser uploads + auth)
    supabase-server.ts           Cookies-aware server client + requireAdminRow
    resend.ts                    Email client + recipient/from resolution
    inquiry-email.ts             Sales notification template + send
    whatsapp.ts                  wa.me deeplink builder + message templates
    uploads.ts                   Browser file upload + MIME/size validation

supabase/
  migrations/
    0001_initial_schema.sql      Inquiries, items, uploads, RLS, rfq_seq
    0002_storage_bucket.sql      inquiry-uploads private bucket + policies
    0003_admin.sql               admin_users allowlist + is_admin() + RLS

docs/
  PHASE-1-SETUP.md               Supabase + Resend one-time setup
  PHASE-4-ADMIN.md               Admin dashboard setup + workflow
  FUTURE-TODO.md                 Deferred operational items
  claude-memory/                 Committed snapshot of Claude's project memory
```

## Content workflow

All user-facing text lives in `src/content/*.ts` and
`src/data/*.ts`. Components are content-free. Non-developers edit
those TypeScript files directly — the shape is enforced by
`typeof en`, so TS flags missing Chinese translations.

Unverified business facts (MOQ tiers, cert validity, lead times, etc.)
are wrapped in `placeholder("Label", "What we need")` and render as
clay-colored **"To be provided"** cards — intentionally visible so
reviewers see exactly what's missing, rather than silent fabrication.
Full list in [`CONTENT-TODO.md`](CONTENT-TODO.md).

## Inquiry flow

1. Buyer configures a product (size / color / material / qty / notes)
   and clicks **Add to Inquiry** or **Request Quote Now**.
2. Selections persist in `localStorage` via `InquiryContext`.
3. Buyer goes to `/inquiry`, reviews line items (variant chips + per-
   item notes), optionally attaches files (logo / design brief /
   artwork / reference; PDF, PNG, JPG, SVG, AI up to 20 MB each).
4. Contact form: Name* + Email* (required); Company + preferred-
   contact-method dropdown (WhatsApp / WeChat / Phone / Telegram /
   Line / Other, with a dynamic handle field) + general Message
   (all optional).
5. On submit:
   - Files upload directly from browser to Supabase Storage via the
     publishable key (bypasses Vercel's serverless body-size limit).
   - Metadata POSTs to `/api/inquiry` — server inserts `inquiries` +
     `inquiry_items` + `inquiry_uploads` rows, generates a human-
     readable `RFQ-2026-00042` ID via a Postgres sequence.
   - Resend sends the sales team a rich HTML email: contact,
     variants per item, internal notes, clickable 7-day signed
     download URLs per attachment.
   - Server returns `{ok: true, requestId}`.
6. Success page shows the request ID and a **Chat with us on
   WhatsApp** button with a pre-filled message (request ID + name +
   company + product list + buyer's Message) so sales can act
   straight from the WhatsApp thread.
7. Persistent WhatsApp CTA (header pill on desktop, floating bubble
   on mobile) available on every page with a generic pre-fill.

**Graceful fallback**: missing Supabase env → synthetic
`LOCAL-DEV-<ts>` request ID, logs instead of persisting. Missing
Resend API key → emails silently skip. Missing storage bucket →
uploads silently skip.

## i18n

- English is default (`/`). Chinese at `/zh/*` (e.g. `/zh/products`,
  `/zh/contact`).
- Language switcher in the header preserves the current path when
  toggling (via `swapLocale` in `src/lib/i18n.ts`).
- Content files author EN + ZH side-by-side; TypeScript enforces
  parity. Missing translation keys are a build error.
- `<html lang>` stays `"en"` (App Router root-layout limitation).
  Chinese pages set `<main lang="zh-CN">` for screen-reader
  correctness.

## Admin dashboard (`/admin`)

Internal tool for sales. Email + password auth via Supabase,
allowlist-gated by the `admin_users` table. (Magic-link is deferred
until a custom SMTP / verified domain is configured — Supabase's
built-in email service is too rate-limited for daily sales-team use.)

Surfaces:
- `/admin/login` — email + password sign-in
- `/admin/inquiries` — paginated list, search (name/company/email/
  request-ID), status filter, sort
- `/admin/inquiries/[id]` — contact, buyer message, line items with
  variant chips and per-item attachments (click = fresh 1-hour signed
  URL), editable status / assignee / internal notes

Setup: [`docs/PHASE-4-ADMIN.md`](docs/PHASE-4-ADMIN.md). Apply the
`0003_admin.sql` migration, seed your email in `admin_users`,
provision the auth user (Dashboard or
`scripts/set-admin-password.mjs`), sign in.

## Deploying to Vercel

Standard Next.js App Router project — no custom build config.

1. Push to GitHub.
2. Vercel → **Add New → Project** → import the repo.
3. Accept defaults (Framework: Next.js, Build: `npm run build`).
4. Set environment variables (**Project → Settings → Environment
   Variables**):

   | Var                                    | Required | Notes                                      |
   |----------------------------------------|:---:|-------------------------------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL`             | ✅  | `https://<ref>.supabase.co`                     |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅  | `sb_publishable_...` (legacy `_ANON_KEY` also accepted) |
   | `SUPABASE_SECRET_KEY`                  | ✅  | `sb_secret_...` (legacy `SERVICE_ROLE_KEY` also accepted). Server-only — no NEXT_PUBLIC prefix. |
   | `RESEND_API_KEY`                       | ✅  | `re_...`                                         |
   | `INQUIRY_TO_EMAIL`                     | optional | Default `sale2@i-coming.com`. Comma-sep for multiple. |
   | `RESEND_FROM_EMAIL`                    | optional | Set once you verify a sending domain.       |

5. Deploy. Verify `/`, `/zh`, `/products`, `/admin/login`, submit a
   test inquiry end-to-end.

## Phases completed

- **Phase 1** — Inquiry persistence to Supabase, transactional email
  via Resend, WhatsApp CTAs, bilingual contact form, request-ID
  generation, graceful fallbacks.
- **Phase 2** — Variant pickers (size/color/material with Custom
  escape hatch), tier pricing, quantity stepper, two-CTA product
  flow (Add to Inquiry + Request Quote Now), multi-image gallery,
  customer file uploads with signed-URL sales email.
- **Phase 4** — `/admin` dashboard (email+password auth, allowlist,
  inquiry list + detail, status/assignee/notes editing, fresh
  signed-URL attachment downloads).

## Known limitations (V1)

- **`<html lang>` is always `"en"`** — Chinese pages use `<main
  lang="zh-CN">`. Fixable with middleware + header injection later.
- **Resend sandbox sender** — `onboarding@resend.dev` can only
  deliver to the Resend account owner. Verify a real domain for
  production. See `docs/FUTURE-TODO.md`.
- **Product catalog edited via TS files** — Phase 5 will move this
  into the admin dashboard with DB-backed products.
- **9 of ~158 historical products** migrated for V1.
- **No per-assignee visibility** in admin — all admins see all
  inquiries. Revisit when the team exceeds ~5.
- **Placeholder pricing/variants** — real sales-verified values
  replace them through the admin dashboard in Phase 5.
- **Sandbox gotcha recap**: `×` and `–` replaced with ASCII `x` / `-`
  in data files; some Windows / email-client fonts rendered the
  multi-byte characters as `�`. Keep data ASCII-safe for numeric
  separators (see `CLAUDE.md`).

## Deferred operational items

Tracked in [`docs/FUTURE-TODO.md`](docs/FUTURE-TODO.md):
- Verify Resend sending domain (`rfq@i-coming.com`)
- Separate preview vs production Supabase projects
- Error monitoring (Vercel observability → Sentry if needed)
- SEO polish (sitemap, robots, OG, hreflang, JSON-LD)
- Finalize production DB config (key rotation, region, backups)

## Further reading

- [`CLAUDE.md`](CLAUDE.md) — conventions + gotchas for AI-assisted
  development (also worth a human skim).
- [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md) — Supabase +
  Resend first-time setup.
- [`docs/PHASE-4-ADMIN.md`](docs/PHASE-4-ADMIN.md) — admin
  dashboard setup + workflow.
- [`docs/FUTURE-TODO.md`](docs/FUTURE-TODO.md) — operational
  deferrals awaiting your action.
- [`CONTENT-TODO.md`](CONTENT-TODO.md) — business content gaps
  (specs, certs, factory photography).
- [`docs/claude-memory/`](docs/claude-memory/) — committed Claude
  memory snapshot for cross-machine continuity.
