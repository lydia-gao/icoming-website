-- ============================================================================
-- ICOMing Product CMS V1 — Phase 6.A
-- ============================================================================
-- Tables, RLS, and indexes backing the sales-managed product catalog.
-- The current static catalog in src/data/products.ts stays the canonical
-- source of truth for the public site until sales explicitly migrates
-- via the admin "Migrate static catalog" action (lands in 6.B/6.F).
-- Empty tables = site renders identically to today.
--
-- Run after 0004_cms.sql. Idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- products — one row per catalogue entry. Bilingual scalars as paired
-- _en / _zh columns; bilingual variant arrays as JSONB so reorder /
-- per-row edits map cleanly to a "rebuild full array on save" UX.
--
-- JSONB shapes (validated app-side at write time):
--   price_tiers   : [ { min_qty: int, max_qty?: int, unit_price: string } ]
--   sizes         : [ { en: string|null, zh: string|null } ]
--   materials     : [ { en: string|null, zh: string|null } ]
--   customization : [ { en: string|null, zh: string|null } ]
--   tags          : [ { en: string|null, zh: string|null } ]
--   colors        : [ { name_en: string|null, name_zh: string|null, hex?: string|null } ]
--   specs         : [ { label_en, label_zh, value_en, value_zh } ]
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  category_slug       text not null,
  status              text not null default 'draft'
                      check (status in ('draft', 'published', 'archived')),

  name_en             text,
  name_zh             text,
  summary_en          text,
  summary_zh          text,
  description_en      text,
  description_zh      text,
  moq_en              text,
  moq_zh              text,
  lead_time_en        text,
  lead_time_zh        text,

  min_order_qty       integer,
  currency            text not null default '$',

  price_tiers         jsonb not null default '[]'::jsonb,
  sizes               jsonb not null default '[]'::jsonb,
  colors              jsonb not null default '[]'::jsonb,
  materials           jsonb not null default '[]'::jsonb,
  customization       jsonb not null default '[]'::jsonb,
  specs               jsonb not null default '[]'::jsonb,
  tags                jsonb not null default '[]'::jsonb,

  featured            boolean not null default false,
  position            integer not null default 0,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references auth.users(id),
  updated_by          uuid references auth.users(id)
);

create index if not exists products_status_idx
  on public.products (status);
create index if not exists products_category_idx
  on public.products (category_slug, status);
create index if not exists products_featured_idx
  on public.products (featured, status);

-- ---------------------------------------------------------------------------
-- product_images — 1:N child of products. Reorder via position; explicit
-- primary flag (partial unique index ensures at most one per product).
--
-- storage_path accepts two forms:
--   - bare object key in cms-images bucket (e.g. "abc-123.jpg") for new
--     uploads; resolved to a public Supabase URL by cmsImageUrl.
--   - leading "/" path (e.g. "/images/products/cotton-tote.jpg") for
--     migrated static images served from /public; cmsImageUrl passes
--     these through unchanged so seeded products keep their existing
--     images without a file copy.
-- ---------------------------------------------------------------------------
create table if not exists public.product_images (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  storage_path    text not null,
  alt_en          text,
  alt_zh          text,
  position        integer not null default 0,
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

create unique index if not exists one_primary_per_product
  on public.product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- Public reads are gated to status='published' so drafts and archives
-- never leak. Admin reads bypass via the is_admin() function (same
-- allowlist used by the inquiry + CMS surfaces).
-- ---------------------------------------------------------------------------
alter table public.products       enable row level security;
alter table public.product_images enable row level security;

-- products: public sees published only; admins see all
drop policy if exists "public can read published products"  on public.products;
drop policy if exists "admins can read all products"        on public.products;
drop policy if exists "admins write products"               on public.products;

create policy "public can read published products"
  on public.products for select
  to anon, authenticated
  using (status = 'published');

create policy "admins can read all products"
  on public.products for select
  to authenticated
  using (public.is_admin());

create policy "admins write products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- product_images: public sees images of published products only
drop policy if exists "public can read images of published products"
  on public.product_images;
drop policy if exists "admins can read all product_images"
  on public.product_images;
drop policy if exists "admins write product_images"
  on public.product_images;

create policy "public can read images of published products"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and p.status = 'published'
    )
  );

create policy "admins can read all product_images"
  on public.product_images for select
  to authenticated
  using (public.is_admin());

create policy "admins write product_images"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants — explicit so a freshly-created Supabase project gets the right
-- privileges regardless of default-privilege configuration.
-- ---------------------------------------------------------------------------
grant select
  on table public.products, public.product_images
  to anon, authenticated;

grant select, insert, update, delete
  on table public.products, public.product_images
  to authenticated;

grant all
  on table public.products, public.product_images
  to service_role;
