# CLAUDE.md — conventions for AI-assisted development

Auto-loaded by Claude Code at session start. Keeps any new session
on the right track without re-reading the whole codebase.

## Project

Bilingual (EN / 简体中文) B2B catalog + RFQ site for **Pingyang ICom
Bag Co., Ltd.** (Chinese legal name **平阳爱康箱包有限公司**, Chinese
brand **爱康**, English brand **ICOMing**). Eco-friendly bag
manufacturer in Wenzhou, Zhejiang.

Users: overseas B2B buyers + the internal Chinese sales team. Not
e-commerce — no direct checkout, ever.

Primary contact: Lydia Gao (`Lydia.Gao@cci.com`).

## Stack (frozen for V1)

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS ·
Supabase (Postgres + Auth + Storage) · Resend · Vercel.

No third-party CMS — sales-editable content lives in Supabase tables
(see Phase 5 below). No separate backend. No ORM — plain
`@supabase/supabase-js`. Auth is Supabase email + password (V1;
magic-link deferred until custom SMTP is configured).

## Phases delivered

1. **Phase 1** — Inquiry persistence to Supabase, Resend sales
   notification, request-ID generation (`RFQ-YYYY-NNNNN`), WhatsApp
   quick-follow-up CTAs, graceful env-fallback.
2. **Phase 2** — Product detail with variant pickers (size/color/
   material, each with a "Custom" escape hatch), tier pricing,
   quantity stepper, two-CTA flow, multi-image gallery, file uploads
   direct to Supabase Storage with signed download URLs in the sales
   email.
3. **Phase 4** — `/admin` dashboard: email+password auth (originally
   shipped as magic-link; switched in V1 due to email rate limits),
   `admin_users` allowlist, inquiry list with search/filter/sort/
   pagination, inquiry detail with editable status/assignee/internal-
   notes and fresh 1-hour signed download URLs.
4. **Phase 5** — Content CMS V1. Sales can edit fixed-section text +
   images and manage repeatable cards (Customization groups,
   Factory/Team/Trade-show galleries, Why Choose Us cards,
   Credentials) via `/admin/content`. Static files in
   `src/content/*.ts` remain the default; CMS rows override.
   Three tables + a public storage bucket (migration `0004_cms.sql`).
   Soft delete with restore UI; bilingual EN/ZH side-by-side editing.
5. **Phase 6** — Product CMS V1. Sales-owned product catalog with
   bilingual editing, status workflow (draft / published / archived),
   tier pricing, variant arrays (sizes, colors, materials,
   customization, specs, tags), and an image manager (upload,
   reorder, set primary, alt text). Public catalog (`/products`,
   `/categories/[slug]`, `/products/[slug]`, home featured grid)
   reads DB published rows with per-surface static fallback.
   Two tables (`products`, `product_images`), migration `0005_products.sql`.
   One-time **"Migrate static catalog"** action seeds the existing
   18 products as drafts. Slugs lock once a product is first
   published.

## Not done (don't build unprompted)

- **Phase 7+** — Category CMS (categories are intentionally still
  static — only ~17 of them, slugs are SEO-sensitive). Add only if
  sales explicitly asks. See `docs/PHASE-6-PRODUCTS.md` for the
  reasoning. Do NOT extend the Phase 5 CMS into a page-builder —
  layout stays hardcoded.
- Operational items in [`docs/FUTURE-TODO.md`](docs/FUTURE-TODO.md):
  Resend domain verification, separate preview/prod Supabase
  projects, error monitoring, SEO polish, prod DB hardening.

## Architectural patterns — match these when writing code

**Routing / i18n.** Two parallel route trees:
- `src/app/(site)/*` for English (URLs have no prefix).
- `src/app/zh/*` for Chinese (URLs are `/zh/...`).
  Page wrappers are thin — they render a single component from
  `src/views/` passing `locale="en"` or `locale="zh"`. Never put
  page JSX directly in a route file if both locales will need it.

**Content & data shape.**
- `src/content/*.ts` exports `Record<Locale, Shape>` for page copy.
  `const zh: typeof en = { ... }` forces the compiler to enforce
  parity — adding a key to `en` without adding to `zh` fails the
  build. Respect that constraint.
- `src/data/categories.ts` keeps English as source of truth; Chinese
  lives under `translations.zh` as an optional overlay merged by
  `resolveCategory`.
- `src/data/products.ts` is now a **fallback-only catalog** post
  Phase 6 — DB-backed `products` table is canonical for any catalog
  surface where sales has published rows. The static file remains
  during the migration window for cold-DB rendering. See Product CMS
  pattern below.
- `src/content/ui.ts` holds shared UI strings (nav, buttons, form
  labels, metadata) also keyed by locale.
- Never hardcode user-facing text in a component. Add it to the
  appropriate content file.

**Unverified facts.** Any business claim the business team hasn't
confirmed goes through `placeholder("Short label", "What the business
team needs to supply")` from `src/content/_types.ts`. Renders as a
clay-colored "To be provided" card on the page. Never fabricate
numbers (MOQ, cert validity, export-country counts, etc.) to look
complete.

**Supabase clients** — four flavours, match them to context:
- `src/lib/supabase.ts` → **service-role** client. Server-only. RLS
  bypass. Used by admin API routes (after `requireAdminRow()`) and
  for service-side reads where RLS would block the operation.
- `src/lib/supabase-browser.ts` → **publishable** client built via
  `createBrowserClient` from `@supabase/ssr`. Client components.
  For direct browser → Storage uploads (`inquiry-uploads`,
  `cms-images`) and `signInWithPassword` calls. Subject to RLS.
- `src/lib/supabase-server.ts` → **cookies-aware server** client for
  server components / route handlers that need the *authenticated
  user's* session. Exports `requireAdminRow()` helper which returns
  `{ user_id, email, full_name, role }`.
- `src/lib/supabase-public.ts` → **anonymous publishable** client
  (no cookies, no session). Server-side reads of public CMS content
  in marketing pages — keeps the service-role surface small.

**Env names.** Code accepts both the new and legacy Supabase key
models: prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` /
`SUPABASE_SECRET_KEY`; falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY`. Docs lead with the new names.

**Admin auth.** Email + password (Supabase `signInWithPassword`).
Magic-link was scoped out for V1 because Supabase's built-in email
service has tight per-project rate limits that break a small
sales-team workflow; revisit once a custom SMTP / verified domain is
configured. `admin_users` is the source of truth for who can sign
in. `is_admin()` Postgres fn checks `auth.jwt() ->> 'email'` against
the allowlist (case-insensitive via `lower()`). Server-side pattern:
```ts
const admin = await requireAdminRow();
if (!admin) redirect("/admin/login"); // or return 401 in API
```
`requireAdminRow()` uses `ilike` so it tolerates mixed-case rows in
`admin_users.email`. The browser client is `createBrowserClient`
from `@supabase/ssr` (PKCE + cookie storage) so future password-
recovery / email-confirmation flows that go through `/auth/callback`
work end-to-end.

**Admin onboarding & password reset.** No user-facing "forgot
password" flow exists in V1 — recovery would otherwise hit the same
rate-limited email service we're avoiding. Lydia provisions accounts
and resets passwords offline:
- **Create user**: Supabase Dashboard → Authentication → Users → Add
  user → "Create new user" (instant, no email sent). Then add the
  email to `public.admin_users` with `active = true`.
- **Reset password without email**: run
  `node --env-file=.env.local scripts/set-admin-password.mjs <email> [newpass]`.
  Generates a random password if `[newpass]` is omitted; creates the
  auth user if they don't yet exist (auto-confirmed). Uses
  `SUPABASE_SECRET_KEY` — dev machine only.

**API routes.** `/api/inquiry` accepts public JSON payloads from
the browser — validates name+email, inserts inquiry+items+uploads,
generates signed URLs for the sales email, sends via Resend best-
effort. `/api/admin/*` requires `requireAdminRow()` first.

**Content CMS V1.** Sales-managed text + images + cards layered on
top of static defaults. See [`docs/PHASE-5-CMS.md`](docs/PHASE-5-CMS.md)
for the full operator/dev guide. Key pieces:
- Three tables: `cms_sections` (singletons), `cms_groups`,
  `cms_cards`. Public `cms-images` Storage bucket for uploads.
- `src/lib/cms-schemas.ts` is the declarative source of truth —
  adding a new editable section means adding an entry there and
  wiring the view to merge `pickField` / `loadCmsSection` /
  `loadCmsCards` over the static fallback.
- Static-first fallback: empty DB renders identically to today.
  Sections are per-field overrides; card sections are
  all-or-nothing (any active group → CMS replaces static).
- Cache: views call `loadCmsSection` / `loadCmsCards` (both wrapped
  in `unstable_cache` with the `"cms"` tag). Admin writes call
  `flushCmsCaches(page)` from `src/lib/cms-revalidate.ts` to
  invalidate. New sections need an entry in `pathsForPage()`.
- Soft delete (`active=false`) for groups/cards. Public RLS hides
  them; admin restore UI in the card manager brings them back.
- Image uploads go browser → Supabase Storage directly via
  `uploadCmsImage` (RLS gates inserts to `is_admin()`).
- `next.config.ts` whitelists `*.supabase.co/storage/v1/object/public/**`
  for `next/image`.

**Product CMS V1 (Phase 6).** Same patterns as the Content CMS,
extended to the product catalog. See
[`docs/PHASE-6-PRODUCTS.md`](docs/PHASE-6-PRODUCTS.md) for the
operator + dev guide. Key pieces:
- Two tables: `products` (bilingual scalars + JSONB variant arrays
  for `price_tiers` / `sizes` / `colors` / `materials` /
  `customization` / `specs` / `tags`) and `product_images` (1:N,
  position-ordered, `is_primary` flag with a partial unique index).
  Migration `0005_products.sql`. Reuses the `cms-images` bucket.
- Status workflow: `draft` (admin-only) → `published` (live) →
  `archived` (soft-deleted). RLS hides non-published from public.
  Slugs lock once a product is first published; revert to draft to
  rename. No 308 redirects in V1.
- Public reads via `src/lib/products-public.ts` —
  `getProductsForListPublic` / `getProductsByCategoryPublic` /
  `getProductBySlugPublic` / `getFeaturedProductsPublic`. Each falls
  back to the static catalog when the DB is empty for the matching
  surface (per-category granularity), so partial migrations stay
  usable. The mapper `dbToProduct` reshapes the DB row into the
  static `Product` type so view components don't change.
- One-time **"Migrate static catalog"** action on `/admin/products`
  (POST `/api/admin/products/migrate`) seeds all 18 static products
  as drafts; image paths are stored as the existing `/images/...`
  paths and resolve via `cmsImageUrl`'s pass-through. Sales replaces
  images one at a time; static `src/data/products.ts` becomes dead
  code once everyone is published, deletable then.
- Image set saves are **atomic replace** — `PUT
  /api/admin/products/[id]/images` deletes existing rows and inserts
  the new set. Brief inconsistency window if the insert fails;
  acceptable for admin volume.
- Cache: `loadPublishedProducts` / `loadPublishedProductBySlug` are
  wrapped in `unstable_cache` with the `"products"` tag. Admin writes
  call `flushProductCaches(categorySlug?)` /
  `flushProductDetailCache(slug)` from
  `src/lib/products-revalidate.ts`.
- Inquiry-flow safety is preserved by `inquiry_items` snapshots
  (`product_name_snapshot`, `product_image_snapshot`, `price_snapshot`,
  `variants` JSONB). Editing or archiving a product after submit
  doesn't retroactively change historical RFQs.

**Migrations are append-only.** Don't edit an already-applied SQL
file. Add `0006_*.sql`, `0007_*.sql`. The five existing files
(`0001`–`0005`) ran at various points in dev; structure new work
accordingly.

## Code conventions — prescriptive

- **ASCII-only for numeric separators** in data files. Use `x` and
  `-` — not `×` (U+00D7) or `–` (U+2013). Some email clients and
  Supabase dashboard fonts render the multi-byte characters as `�`.
  Chinese characters are fine; it's only Latin-1 punctuation that
  bites.
- **Grid layouts need `grid-cols-1` on mobile** when any child can
  have intrinsic width larger than the viewport (images, marquees,
  `max-content` tracks). Otherwise the single implicit auto column
  blows out. Pattern: `grid grid-cols-1 ... md:grid-cols-12` not
  just `grid ... md:grid-cols-12`. Child cols also want `min-w-0`.
- **useSearchParams requires Suspense.** Wrap any page that uses it
  in `<Suspense>` in the page wrapper, or the build fails.
- **Client components that need the inquiry cart** call
  `useInquiry()`. Use `upsert()` for explicit configurations
  (product detail panel), `add()` for quick-save from cards
  (doesn't overwrite existing variants), `toggle()` for card
  hearts.
- **Strings typed out of URL params** use `useSearchParams`; drop-
  dead navigation uses `router.replace` with `{ scroll: false }` to
  preserve scroll on filter changes.
- **No comments describing what code does** — names do that. Only
  write comments for *why*: hidden invariants, past incidents,
  subtle workarounds.

## Chinese content — read these carefully

- The Chinese brand is **爱康** (i.e. two characters). Do NOT write
  it as "爱康铭" — that's wrong.
- The Chinese legal name is **平阳爱康箱包有限公司**.
- Don't add "family-run factory" / "家族工厂" / "家族经营" positioning
  to hero copy — the business preference is to not lead with that.
  It was removed in commit `e14ce32`; don't reintroduce.
- When drafting Chinese copy, the business is positioned identically
  to English (B2B for overseas buyers, professional manufacturer).
  The Chinese version exists for internal sales team + Chinese
  partners + occasional domestic clients; positioning does not
  change between locales.

## Gotchas

- **Resend sandbox sender** (`onboarding@resend.dev`) can *only*
  deliver to the Resend account owner's email. Any other recipient
  is rejected with 403. For local testing set `INQUIRY_TO_EMAIL` to
  the Resend signup email; real deployment needs a verified domain.
- **Vercel serverless body size** limits uploads through our API.
  That's why files go browser → Supabase Storage directly (via the
  publishable key), and only metadata goes to `/api/inquiry`.
- **Supabase default privileges** on new projects sometimes miss
  grants for `anon` / `service_role` on tables created via the SQL
  editor. Migration `0001` includes explicit `grant` statements to
  cover this.
- **Supabase dashboard URL ≠ project URL.** The project URL is
  `https://<ref>.supabase.co`; the dashboard URL is
  `https://supabase.com/dashboard/project/<ref>`. Pasting the wrong
  one produces `PGRST125 Invalid path specified in request URL`.
- **Windows git CRLF warnings** on commit are cosmetic — core.autocrlf
  normalizes line endings. Ignore.
- **Dev-server flakiness after long sessions**: occasionally
  subsequent requests return 404 for routes that built fine. Kill
  all zombie `node.exe` processes on Windows and restart. Happens
  after many compile cycles; unrelated to code.

## Commands & git workflow

- `npm run typecheck && npm run build` **must pass** before
  commit/push. Build is the only check that catches missing Suspense
  boundaries and Next.js route shape issues.
- `rm -rf .next` if the build complains about stale types after a
  large refactor.
- Commits use conventional-style prefixes (`feat(...)`, `fix(...)`,
  `chore(...)`, `docs(...)`). Co-authored line at the bottom points
  at Claude.
- **Never push without running the build locally first.** Vercel
  deploys on push; a broken build is user-visible.
- **Never use `--no-verify`** to skip git hooks. No hooks exist
  today, but the project is set up to support them cleanly.
- **Never commit** `.env.local`, Supabase secret keys, Resend keys,
  or anything matching `*.env*` beyond `.env.example`.

## Setting up on a fresh PC

1. `git clone` and `npm install`.
2. Restore Claude's project memory from the committed snapshot:
   copy `docs/claude-memory/*.md` (except README) into
   `C:\Users\<YOU>\.claude\projects\C--Users-<YOU>-Desktop-repos-icoming-website\memory\`
   (create the folder if missing; the path name mirrors the
   flattened repo path).
3. Create `.env.local` from `.env.example` with the Supabase URL +
   publishable + secret keys and the Resend API key.
4. The Supabase project itself is pre-existing — migrations
   `0001`-`0005` have already been applied there. No SQL to run on
   a fresh clone, just point env vars at the same project.
5. `npm run dev`, visit `http://localhost:3000`.
6. For admin: provision an auth user (Dashboard → Authentication →
   Users → Add user, or `node --env-file=.env.local
   scripts/set-admin-password.mjs <email> <password>`), ensure the
   email is in `admin_users` with `active = true`, then visit
   `/admin` and sign in.

Full first-time setup (if the Supabase project is being recreated
from scratch) lives in [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md),
[`docs/PHASE-4-ADMIN.md`](docs/PHASE-4-ADMIN.md),
[`docs/PHASE-5-CMS.md`](docs/PHASE-5-CMS.md), and
[`docs/PHASE-6-PRODUCTS.md`](docs/PHASE-6-PRODUCTS.md).

## Don'ts

- Don't add fabricated business facts (MOQ numbers, export country
  counts, cert claims). Use `placeholder()`.
- Don't reintroduce family-run positioning to hero copy.
- Don't write `爱康铭` (wrong brand). It's `爱康`.
- Don't use `×` / `–` in product data — ASCII `x` / `-` only.
- Don't put user-facing strings directly in components. Add to
  `src/content/*.ts` / `src/data/*.ts`.
- Don't mutate already-applied migrations. Add new numbered ones.
- Don't remove RLS policies without a replacement.
- Don't push without running `npm run build` locally.
- Don't commit secrets. `.env.local` stays local.
- Don't add a payment gateway or buyer-side account system
  without explicit scope — none are planned. The Phase 5 content
  CMS is intentionally NOT a page-builder; sales can edit declared
  sections only. Don't extend it into one.

## Memory files

This repo keeps a snapshot of Claude's auto-memory at
[`docs/claude-memory/`](docs/claude-memory/). That directory is
separate from `CLAUDE.md`: it's restored into a machine-local path
on a new PC so prior-session context carries over. See that folder's
README for the copy-to-local-path procedure.
