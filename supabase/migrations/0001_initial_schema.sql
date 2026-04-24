-- ============================================================================
-- ICOMing RFQ schema — Phase 1
-- ============================================================================
-- Run this against a fresh Supabase project. Either via the SQL editor
-- (Dashboard → SQL → New query → paste → Run) or `supabase db push` if you
-- have the CLI linked.
--
-- Idempotent — safe to re-run during development.
-- ============================================================================

-- Supabase already enables pgcrypto (gen_random_uuid) in the `extensions`
-- schema for every project, so no CREATE EXTENSION is needed.

-- ---------------------------------------------------------------------------
-- Sequence + helper for human-readable request IDs (RFQ-YYYY-00001, ...).
-- The sequence is monotonic across years; the year prefix is just a label.
-- ---------------------------------------------------------------------------
create sequence if not exists public.rfq_seq start 1;

-- ---------------------------------------------------------------------------
-- inquiries: one row per submitted RFQ.
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id                    uuid primary key default gen_random_uuid(),
  request_id            text unique not null default (
    'RFQ-' || extract(year from now())::text
           || '-' || lpad(nextval('public.rfq_seq')::text, 5, '0')
  ),
  created_at            timestamptz not null default now(),
  locale                text not null check (locale in ('en', 'zh')),
  status                text not null default 'new'
                        check (status in ('new', 'in_progress', 'quoted', 'won', 'lost')),

  -- contact (required)
  name                  text not null,
  email                 text not null,

  -- contact (optional)
  company               text,
  contact_method        text check (
    contact_method is null
    or contact_method in ('whatsapp', 'wechat', 'phone', 'telegram', 'line', 'other')
  ),
  contact_handle        text,        -- the actual number/ID for the chosen method
  other_platform_name   text,        -- only used when contact_method = 'other'
  message               text,

  -- admin fields (populated in Phase 4)
  assigned_to           uuid references auth.users(id),
  internal_notes        text
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx     on public.inquiries (status);

-- ---------------------------------------------------------------------------
-- inquiry_items: line items on an RFQ. One row per product the buyer saved.
-- Snapshots product name / image / price so historical records stay truthful
-- if the product data later changes.
-- ---------------------------------------------------------------------------
create table if not exists public.inquiry_items (
  id                     uuid primary key default gen_random_uuid(),
  inquiry_id             uuid not null references public.inquiries(id) on delete cascade,
  created_at             timestamptz not null default now(),
  product_slug           text not null,
  product_name_snapshot  text not null,
  product_image_snapshot text,
  quantity               integer,          -- populated in Phase 2
  variants               jsonb,            -- populated in Phase 2 (size/color/material)
  customization_notes    text,             -- the per-item note from the current inquiry cart
  price_snapshot         text              -- populated in Phase 2
);

create index if not exists inquiry_items_inquiry_idx on public.inquiry_items (inquiry_id);

-- ---------------------------------------------------------------------------
-- inquiry_uploads: customer-uploaded files (logos, design briefs, references).
-- Schema created now; upload UI ships in Phase 2.
-- ---------------------------------------------------------------------------
create table if not exists public.inquiry_uploads (
  id                uuid primary key default gen_random_uuid(),
  inquiry_id        uuid not null references public.inquiries(id) on delete cascade,
  item_id           uuid references public.inquiry_items(id) on delete cascade,
  created_at        timestamptz not null default now(),
  storage_path      text not null,         -- Supabase Storage object key
  original_filename text,
  mime_type         text,
  size_bytes        bigint,
  kind              text                   -- 'logo' | 'design_brief' | 'reference' | null
);

create index if not exists inquiry_uploads_inquiry_idx on public.inquiry_uploads (inquiry_id);

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- ---------------------------------------------------------------------------
-- The API route uses the service-role key and therefore bypasses RLS. These
-- policies exist so that IF the anon key is ever used from the browser
-- (Phase 2 file uploads, etc.) the public can only insert — never read
-- inquiries. No public SELECT policy = public cannot enumerate RFQs.
alter table public.inquiries       enable row level security;
alter table public.inquiry_items   enable row level security;
alter table public.inquiry_uploads enable row level security;

drop policy if exists "public can insert inquiries"        on public.inquiries;
drop policy if exists "public can insert inquiry_items"    on public.inquiry_items;
drop policy if exists "public can insert inquiry_uploads"  on public.inquiry_uploads;

create policy "public can insert inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy "public can insert inquiry_items"
  on public.inquiry_items for insert
  to anon, authenticated
  with check (true);

create policy "public can insert inquiry_uploads"
  on public.inquiry_uploads for insert
  to anon, authenticated
  with check (true);
