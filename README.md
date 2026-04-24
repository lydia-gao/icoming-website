# ICOMing website

Bilingual (English / 简体中文) B2B catalog and lead-gen site for **Pingyang
ICom Bag Co., Ltd.** (平阳爱康箱包有限公司) — eco-friendly bag manufacturer
in Wenzhou, Zhejiang, China.

Built with Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS.
No separate backend — Next.js API routes and local TypeScript data files
are enough for V1.

---

## Quick start

```bash
npm install
cp .env.example .env.local  # adjust if needed, but defaults work for local
npm run dev
```

Open <http://localhost:3000>. The English site is at `/`; the Chinese version
is at `/zh` with a language switcher in the header.

## Scripts

| Command            | What it does                                         |
|--------------------|------------------------------------------------------|
| `npm run dev`      | Start the dev server with hot reload                 |
| `npm run build`    | Production build (all pages pre-rendered / SSG)      |
| `npm start`        | Serve the production build locally                   |
| `npm run lint`     | ESLint (`next lint`)                                 |
| `npm run typecheck`| `tsc --noEmit` — type-only validation                |

Before deploying, run at minimum `npm run typecheck` and `npm run build`.

## Project layout

```
src/
  app/
    layout.tsx            root layout: <html>, <body>, InquiryProvider
    (site)/               English routes (URLs have no prefix)
      layout.tsx          LocaleProvider="en" + Header + Footer
      page.tsx            /
      about/, capabilities/, categories/[slug]/, contact/, inquiry/,
      products/, products/[slug]/, not-found.tsx
    zh/                   Chinese routes (URLs prefixed with /zh)
      layout.tsx          LocaleProvider="zh" + Header + Footer
      (same page tree)
    admin/                Internal admin dashboard (Phase 4)
      (auth)/login/       Magic-link sign-in (public, allowlist-gated)
      (gated)/            Auth-required routes
        layout.tsx        Gate + admin chrome + sign out
        inquiries/        List + filter/sort/search
        inquiries/[id]/   Detail + editable status/assignee/notes
    api/
      inquiry/route.ts           Public POST for inquiry submissions
      admin/
        inquiry/[id]/route.ts    PATCH status/assignee/notes (admin)
        attachment/[id]/route.ts Fresh signed URL for attachment (admin)
      auth/signout/route.ts      Clears session cookie (admin)
    auth/callback/route.ts       Magic-link code exchange target

  middleware.ts           Refreshes Supabase session cookies per request

  views/                  One file per page; takes a `locale` prop.
                          Both English and Chinese route wrappers render
                          the same view component.

  components/             Shared UI (Header, Footer, ProductCard, …)
  content/                User-facing text. Each file exports
                          Record<Locale, Shape> so EN and ZH share one type.
    ui.ts                 Nav, buttons, form labels, metadata strings
    home.ts, about.ts, capabilities.ts, contact.ts, trust.ts
    _types.ts             Placeholder<T> helper for unverified claims
  data/                   Structured data (products, categories, company).
                          Non-English translations attach as
                          optional `translations.zh` overlays.
  lib/
    i18n.ts               Locale type, `localePath`, `swapLocale`
    locale-context.tsx    <LocaleProvider> + useLocale()
    inquiry-context.tsx   Saved-products state (localStorage-backed)
    supabase.ts           Service-role client (server-only, RLS bypass)
    supabase-browser.ts   Browser client for uploads + auth
    supabase-server.ts    Cookies-aware server client + requireAdminRow()
    resend.ts             Email client + recipient/from resolution
    inquiry-email.ts      Transactional notification template + send
    whatsapp.ts           wa.me deeplink builder + message templates
    uploads.ts            Browser file-upload helper + MIME/size validation

supabase/
  migrations/
    0001_initial_schema.sql   Inquiries, items, uploads, RLS, request_id seq
    0002_storage_bucket.sql   inquiry-uploads private bucket + policy
    0003_admin.sql            admin_users allowlist + is_admin() + RLS
```

## Content workflow

All user-visible copy is in `src/content/*.ts` (pages) and
`src/data/*.ts` (products, categories, company info). Components stay
free of hardcoded text. Non-developers can edit these TypeScript files
directly — the shape is inferred from the English copy and TypeScript
will flag missing Chinese translations.

Unverified business facts (MOQ tiers, lead times, cert validity, etc.)
are wrapped in `placeholder("Label", "What we need")` and render as
clay-colored **"To be provided"** cards on the site. This is intentional
for preview / stakeholder review — the missing info is clearly visible,
not silently fabricated. The full list of open items is in
[`CONTENT-TODO.md`](CONTENT-TODO.md).

## Inquiry flow

1. User browses products, clicks **Save** on any card (persists in
   localStorage across pages and across English ↔ Chinese switches).
2. User visits **/inquiry** (or **/zh/inquiry**), reviews saved items,
   adds per-item notes, fills out **Name + Email** (required) plus
   optional **Company**, optional **preferred faster contact method**
   (WhatsApp / WeChat / Phone / Telegram / Line / Other) with a
   dynamic handle field, and an optional general **Message**.
3. On submit, the browser POSTs to `/api/inquiry`.
4. The server:
   - Inserts the inquiry + line items into Supabase Postgres.
   - Generates a `RFQ-{YYYY}-{00001}` request ID via a Postgres sequence.
   - Fires a Resend email to the sales team (`INQUIRY_TO_EMAIL`).
   - Returns `{ ok: true, requestId }`.
5. The success page shows the request ID and a pre-filled
   **Chat with us on WhatsApp** button that deeplinks into WhatsApp
   with the request ID + buyer name + saved products in the message body.

A persistent WhatsApp CTA (header pill on desktop, floating bottom-right
on mobile) sends buyers into WhatsApp with a generic pre-filled message
at any time — independent of the inquiry flow.

**Graceful fallback**: if the Supabase env vars are unset (either the
new `SUPABASE_SECRET_KEY` or the legacy `SUPABASE_SERVICE_ROLE_KEY`),
the API returns a synthetic `LOCAL-DEV-…` request ID and logs the
payload instead of persisting. If `RESEND_API_KEY` is unset, emails
are silently skipped. This keeps local dev working without any
account setup, and makes the app robust when a provider outage hits.

See [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md) for the one-time
Supabase + Resend configuration.

## Admin dashboard (`/admin`)

Internal tool for sales to review and manage RFQs. Magic-link
authentication, allowlist-gated via the `admin_users` table.

Surfaces:
- `/admin/login` — magic-link request form, public
- `/admin/inquiries` — list with search (name/company/email/request-id),
  status filter, sort, pagination
- `/admin/inquiries/[id]` — full detail, variant chips, attachments
  (fresh 1-hour signed URLs per click), editable
  status / assignee / internal notes

Setup is covered in [`docs/PHASE-4-ADMIN.md`](docs/PHASE-4-ADMIN.md):
apply the `0003_admin.sql` migration, seed your email in `admin_users`,
add Supabase Auth redirect URL allowlist entries, sign in.

## i18n at a glance

- English is the default locale (served from `/`).
- Chinese lives under `/zh/*` (e.g. `/zh/products`, `/zh/contact`).
- The language switcher in the header preserves the current path when
  switching (via `swapLocale` in `src/lib/i18n.ts`).
- Translations are authored side-by-side in each content file; the
  TypeScript shape enforces parity (`typeof en` used as the `zh` type).
- See [`docs/claude-memory/project_icoming_rebuild.md`](docs/claude-memory/project_icoming_rebuild.md)
  for the architectural decisions.

## Deploying to Vercel

The repo is a standard Next.js App Router project with no custom build
config — it should Just Work on Vercel.

1. Push to GitHub (or connect the existing remote).
2. Vercel → **Add New… → Project** → import this repository.
3. Accept the defaults:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build` (default)
   - **Output directory:** `.next` (default)
   - **Install command:** `npm install` (default)
4. Add environment variables (**Project → Settings → Environment
   Variables**). All are technically optional — missing ones trigger
   the graceful fallback — but you want these set for a real preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(new `sb_publishable_...`; legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` also accepted)*
   - `SUPABASE_SECRET_KEY` *(new `sb_secret_...`, server-only — don't prefix with NEXT_PUBLIC; legacy `SUPABASE_SERVICE_ROLE_KEY` also accepted)*
   - `RESEND_API_KEY`
   - `INQUIRY_TO_EMAIL` *(defaults to `sale2@i-coming.com`; comma-separated for multiple recipients)*
   - `RESEND_FROM_EMAIL` *(optional; defaults to Resend's sandbox sender)*

   See [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md) for how to
   create the Supabase project, apply the schema, and set up Resend.
5. Deploy. Preview URLs cover all routes under `/` and `/zh/*`.
6. On the first deploy, verify:
   - `/`, `/zh`, `/products`, `/zh/products/promotional-cotton-canvas-tote`,
     `/inquiry`, `/zh/contact` all render correctly.
   - Submit the inquiry form end-to-end. Expect a real
     `RFQ-{year}-{nnnnn}` request ID, a row in the Supabase
     `inquiries` table, a notification email at the configured address,
     and a working **Chat with us on WhatsApp** deeplink on the success
     page.
   - The floating WhatsApp button on mobile and the pill in the desktop
     header both open WhatsApp with a generic pre-filled message.

No cron, no edge middleware, no custom regions needed.

## Known limitations (V1)

- **`<html lang>` stays `en`** on every page. Chinese pages set
  `<main lang="zh-CN">` for screen-reader correctness. Fixing this to
  vary per locale requires either a `[locale]` dynamic segment at the
  root or middleware with header injection — deferred.
- **Inquiry emails are sent from `onboarding@resend.dev`** by default.
  Deliverability is workable but not great (expect some spam folders
  on first send). Verify a real domain (e.g. `rfq@i-coming.com`) in
  Resend and set `RESEND_FROM_EMAIL` before go-live.
- **Specs, MOQ, lead-time, cert validity** are rendered as
  "To be provided" placeholders until the business team fills them in.
  See `CONTENT-TODO.md`.
- **9 of ~158 historical products** are migrated for V1. Scale the
  rest after direction is approved.
- **Factory/team photography** is limited; the biggest trust lift
  before go-live is a half-day photoshoot (see `CONTENT-TODO.md` §6).
- **Product detail page is pre-variant** — no quantity, size/color
  pickers, tier pricing, or file uploads yet. That's Phase 2
  (see roadmap).
