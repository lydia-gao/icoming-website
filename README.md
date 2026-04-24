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
    api/
      inquiry/route.ts    POST endpoint for inquiry form

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
   adds per-item notes, fills out contact details, picks preferred
   reply channel (email / WhatsApp / phone).
3. On submit, the browser POSTs to `/api/inquiry`.
4. The server logs the submission (visible in Vercel logs) and returns
   `{ ok: true }`. **Email delivery is intentionally not wired yet** —
   V1 ships as a captured-lead-to-logs flow. Swap in a provider by
   editing `src/app/api/inquiry/route.ts` (see the comment there).

The `INQUIRY_TO_EMAIL` environment variable is reserved for the future
email routing; nothing breaks if it's unset (falls back to
`sale1@i-coming.com`).

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
4. (Optional) Add environment variables:
   - `INQUIRY_TO_EMAIL` — address that server logs reference as the
     destination. Unset is fine for the preview deployment.
   - When you wire a real email provider, add its keys here (e.g.
     `RESEND_API_KEY`). See `.env.example` for the reserved names.
5. Deploy. Preview URLs cover all routes under `/` and `/zh/*`.
6. On the first deploy, verify `/`, `/zh`, `/products`,
   `/zh/products/promotional-cotton-canvas-tote`, `/inquiry`,
   `/zh/contact`, and try submitting the inquiry form — you should see
   the submission in the Vercel **Runtime Logs** tab for
   `/api/inquiry`.

No database, no cron, no edge middleware, no custom regions needed.

## Known limitations (V1)

- **`<html lang>` stays `en`** on every page. Chinese pages set
  `<main lang="zh-CN">` for screen-reader correctness. Fixing this to
  vary per locale requires either a `[locale]` dynamic segment at the
  root or middleware with header injection — deferred.
- **Inquiry emails are not delivered** — submissions are logged only.
  Wire a provider before go-live (see the route file).
- **Specs, MOQ, lead-time, cert validity** are rendered as
  "To be provided" placeholders until the business team fills them in.
  See `CONTENT-TODO.md`.
- **9 of ~158 historical products** are migrated for V1. Scale the
  rest after direction is approved.
- **Factory/team photography** is limited; the biggest trust lift
  before go-live is a half-day photoshoot (see `CONTENT-TODO.md` §6).
