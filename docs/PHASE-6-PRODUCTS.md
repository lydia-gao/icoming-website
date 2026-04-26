# Phase 6 — Product CMS V1

Sales owns the product catalog. Create, edit, publish, archive,
upload images, manage tier pricing and variants — all without an
engineering deploy. The static catalog in `src/data/products.ts`
remains as a fallback during the migration window; once sales has
published their working set, the DB is canonical and the static
file becomes dead code (deletable in a follow-up).

This guide covers: what's editable, the data model, the one-time
migration step, day-to-day product management, and the slug / SEO
policy.

## What sales can manage

Visit `/admin/products` after signing in.

| Surface | What's editable |
|---|---|
| **Status** | Draft / Published / Archived (only Published renders publicly) |
| **Featured flag** | Up to 4 published-featured products surface on the home page; admin shows the count |
| **Slug** | URL piece, locked once first published |
| **Category** | Dropdown of the 17 static categories |
| **Names** | Bilingual EN/ZH side-by-side |
| **Summary, description** | Bilingual EN/ZH |
| **MOQ** | Display string (bilingual) + numeric min order qty |
| **Currency, lead time** | Currency symbol + bilingual lead-time string |
| **Price tiers** | Min qty / max qty (or "and up") / unit price; ascending, non-overlapping enforced |
| **Sizes, materials, customization options, tags** | Bilingual repeatable rows |
| **Colors** | Bilingual name + hex (with live swatch preview) |
| **Specs** | Free-form bilingual label/value pairs (Width, Height, Weight, Capacity, etc.) |
| **Images** | Multi-upload, reorder, set primary, alt EN/ZH per image |

Categories themselves stay static and are managed in code (Phase 7
adds Category CMS only if sales asks for it).

## Data model

Two tables, both in `public`. Migration:
`supabase/migrations/0005_products.sql`.

```text
products
  id              uuid PK
  slug            text UNIQUE NOT NULL
  category_slug   text NOT NULL          -- references static categories
  status          text                   -- draft | published | archived
  name_*, summary_*, description_*,
  moq_*, lead_time_*                     -- bilingual scalar columns (_en / _zh)
  min_order_qty   integer                -- drives quantity stepper
  currency        text DEFAULT '$'
  price_tiers     jsonb                  -- [{ min_qty, max_qty?, unit_price }]
  sizes           jsonb                  -- [{ en, zh }]
  colors          jsonb                  -- [{ name_en, name_zh, hex? }]
  materials       jsonb                  -- [{ en, zh }]
  customization   jsonb                  -- [{ en, zh }]
  specs           jsonb                  -- [{ label_en, label_zh, value_en, value_zh }]
  tags            jsonb                  -- [{ en, zh }] (no public filter UI yet)
  featured        boolean
  position        integer                -- ordering on /products list
  created_at, updated_at, created_by, updated_by

product_images
  id              uuid PK
  product_id      uuid FK → products.id ON DELETE CASCADE
  storage_path    text                   -- bucket key OR /images/... legacy path
  alt_en, alt_zh  text
  position        integer
  is_primary      boolean
  created_at
```

Reuses the **`cms-images`** Storage bucket from Phase 5 — public
read, admin-only writes via `is_admin()`. New uploads land there;
migrated paths point at `/public/images/products/...` and resolve
through `cmsImageUrl`'s pass-through.

A partial unique index `(product_id) WHERE is_primary` enforces at
most one primary image per product. The image-set save endpoint
deletes existing rows before inserting to avoid transient
violations.

## RLS summary

- **Public** (anon + authenticated):
  - `products`: SELECT only where `status = 'published'`.
  - `product_images`: SELECT only when joined to a published product.
- **Admin** (`is_admin()`):
  - Both tables: full read of every status, full write.
- **Service-role**: bypasses RLS; used by API routes after
  `requireAdminRow()` and by the public-read fall-back path
  (`src/lib/supabase-public.ts`) for cached anon reads.

## One-time migration: copying the static catalog

The static catalog in `src/data/products.ts` is acknowledged as
mostly placeholder. The CMS won't auto-seed silently — sales
explicitly triggers migration so they consciously review.

**Steps:**

1. Apply the migration to Supabase:
   - Dashboard → SQL editor → New query → paste
     `supabase/migrations/0005_products.sql` → Run.
   - Idempotent. Creates `products` + `product_images`, RLS
     policies, indexes.
2. Visit `/admin/products`. The "Migrate static catalog" banner
   appears whenever the table is empty.
3. Click **Migrate static catalog**. Each of the 18 static products
   gets inserted as a draft, with images pointing at the existing
   `/images/products/...` paths. Confirms when done.
4. Review each draft, fix names / pricing / descriptions, replace
   the stock images with actual product photos as needed.
5. Switch status to **Published** when satisfied. The public site
   starts rendering that product from the DB the moment it's
   published.

The migration banner disappears once any product exists in the DB.
Re-migration requires hard-deleting all rows from the Supabase
dashboard — a deliberate guard.

## Public-site fallback policy

Per-surface fallback during the migration window:

- **`/products`** (catalog list) — DB published catalog, else full
  static catalog.
- **`/categories/[slug]`** — DB published in this category, else
  static products in this category.
- **`/products/[slug]`** — DB published by slug, else static by
  slug.
- **Home featured grid** — DB published-featured (up to 4), else
  static featured.

Each surface decides independently, so a partially-migrated catalog
keeps unpublished categories rendering from static until sales
catches up. Once every product is published in the DB, the static
file is unreachable and can be deleted.

When sales archives or unpublishes the last published product in a
category, that category falls back to static again — the rule is
deterministic, not progressive.

## Slug policy (SEO safety)

- New products: slug is auto-suggested from the EN name, freely
  editable while the product is a draft.
- First publish: slug locks. The edit form disables the field with a
  tooltip explaining the lock. To rename, revert status → draft,
  edit slug, re-publish.
- No 308 redirects. Sales is expected to think before renaming a
  published product. If a rename is unavoidable, the old URL
  404s — coordinate with anyone holding outbound links.

## Day-to-day management

**List view (`/admin/products`)**
- Default filter: **Active** (draft + published; archived hidden).
  Click the Archived chip to find archived products.
- Search: name (EN/ZH) or slug.
- Filter by category dropdown.
- Header shows total count, plus how many are featured (and
  whether more than 4 are competing for the home page slots).
- "Missing EN" / "Missing ZH" badges flag rows where one language
  side is empty.

**Edit page (`/admin/products/[id]`)**
- Top: Manage panel (status, featured) — independent quick saves.
- Basics editor: slug, category, name, summary, description, MOQ
  display + numeric, currency, lead time. Sticky save bar with
  dirty tracking and per-field "Missing — falls back to default"
  warnings.
- Tier pricing: numeric rows with row-specific server-side
  validation messages (overlap, non-integer min, missing price).
- Variants & specs: sizes, colors (with hex preview), materials,
  customization options, specs (label/value bilingual), tags.
  Single save commits the whole panel.
- Images: drag-drop or click-to-upload, alt text per image,
  reorder, primary toggle, atomic save replaces the whole image
  set.

**Inquiry flow safety**
Existing RFQs are unaffected by product edits. The `inquiry_items`
table snapshots `product_name_snapshot`, `product_image_snapshot`,
`price_snapshot`, and `variants` (JSONB) at submit time, so
historical RFQs never retroactively change when sales tweaks
product data later.

## Adding a new product

1. `/admin/products` → **+ New product**.
2. Enter name (EN at least), slug auto-fills, pick category. Click
   Create as draft.
3. Lands on the edit page; fill in the rest at your own pace.
4. Upload images, set primary.
5. Switch status to Published when ready. The product appears on
   `/products`, the relevant category page, and the home featured
   grid (if marked featured) on the next request — public cache
   TTL is 60s but admin saves call `flushProductCaches` /
   `flushProductDetailCache` for immediate propagation.

## Caveats and future enhancements

V1 trade-offs deliberately deferred:

- **Image orphans.** Replacing or removing a product image leaves
  the old object in `cms-images`. Cleanup script in V2.
- **Audit trail UI.** `created_by` / `updated_by` are stamped but
  not surfaced in admin. Query `admin_users` directly if you need
  to know who last edited what.
- **Tag filtering on the public site.** Tags are stored but no
  buyer-side filter UI surfaces them yet.
- **Variant matrix pricing** (different prices per size or color
  combo) — not in current static data, not in the DB.
- **Inventory / SKU tracking** — not a goal; ICOMing is a
  manufacturer, not a retailer.
- **Drag-handle reorder** — V1 uses ↑↓ buttons across all
  reorder surfaces (consistent with Phase 5).

If sales later wants Category CMS, see the §2 reasoning in the
Phase 6 proposal — it's structurally separate from products and
~2 days of work.
