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

No CMS. No separate backend. No ORM — plain `@supabase/supabase-js`.
Auth is Supabase magic-link.

## Phases delivered

1. **Phase 1** — Inquiry persistence to Supabase, Resend sales
   notification, request-ID generation (`RFQ-YYYY-NNNNN`), WhatsApp
   quick-follow-up CTAs, graceful env-fallback.
2. **Phase 2** — Product detail with variant pickers (size/color/
   material, each with a "Custom" escape hatch), tier pricing,
   quantity stepper, two-CTA flow, multi-image gallery, file uploads
   direct to Supabase Storage with signed download URLs in the sales
   email.
3. **Phase 4** — `/admin` dashboard: magic-link auth, `admin_users`
   allowlist, inquiry list with search/filter/sort/pagination,
   inquiry detail with editable status/assignee/internal-notes and
   fresh 1-hour signed download URLs.

## Not done (don't build unprompted)

- **Phase 5** — admin-managed product catalog (DB-backed products,
  CRUD UI, image uploads for product assets). Products still live in
  `src/data/products.ts` until then.
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
- `src/data/products.ts` and `src/data/categories.ts` keep English
  as the source of truth; Chinese lives under `translations.zh` as
  an optional overlay merged by `resolveProduct` / `resolveCategory`.
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

**Supabase clients** — three flavours, match them to context:
- `src/lib/supabase.ts` → **service-role** client. Server-only. RLS
  bypass. Used by API routes.
- `src/lib/supabase-browser.ts` → **publishable** client. Client
  components. For direct browser → Storage uploads and magic-link
  OTP calls. Subject to RLS.
- `src/lib/supabase-server.ts` → **cookies-aware server** client for
  server components / route handlers that need the *authenticated
  user's* session. Exports `requireAdminRow()` helper.

**Env names.** Code accepts both the new and legacy Supabase key
models: prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` /
`SUPABASE_SECRET_KEY`; falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY`. Docs lead with the new names.

**Admin auth.** Magic-link only. `admin_users` is the source of
truth. `is_admin()` Postgres fn checks `auth.jwt() ->> 'email'`
against the allowlist. Pattern in admin routes:
```ts
const admin = await requireAdminRow();
if (!admin) redirect("/admin/login"); // or return 401 in API
```

**API routes.** `/api/inquiry` accepts public JSON payloads from
the browser — validates name+email, inserts inquiry+items+uploads,
generates signed URLs for the sales email, sends via Resend best-
effort. `/api/admin/*` requires `requireAdminRow()` first.

**Migrations are append-only.** Don't edit an already-applied SQL
file. Add `0004_*.sql`, `0005_*.sql`. The three existing files ran
at various points in dev; structure new work accordingly.

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
4. The Supabase project itself is pre-existing — migrations `0001`,
   `0002`, `0003` have already been applied there. No SQL to run on
   a fresh clone, just point env vars at the same project.
5. `npm run dev`, visit `http://localhost:3000`.
6. For admin: `/admin` → enter an email that's in `admin_users` →
   check inbox → click magic link.

Full first-time setup (if the Supabase project is being recreated
from scratch) lives in [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md)
and [`docs/PHASE-4-ADMIN.md`](docs/PHASE-4-ADMIN.md).

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
- Don't add a CMS, payment gateway, or buyer-side account system
  without explicit scope — none are planned.

## Memory files

This repo keeps a snapshot of Claude's auto-memory at
[`docs/claude-memory/`](docs/claude-memory/). That directory is
separate from `CLAUDE.md`: it's restored into a machine-local path
on a new PC so prior-session context carries over. See that folder's
README for the copy-to-local-path procedure.
