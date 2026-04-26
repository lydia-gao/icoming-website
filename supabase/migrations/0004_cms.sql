-- ============================================================================
-- ICOMing content CMS V1 — Phase 5.A
-- ============================================================================
-- Tables, RLS policies, and storage bucket backing the sales-managed
-- content layer (Hero, Story, Customization cards, Factory gallery, ...).
--
-- DB rows are an OVERRIDE layer — the static content in src/content/*.ts
-- remains the canonical default. Empty rows = site renders as today.
--
-- Run after 0003_admin.sql. Idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- cms_sections — singleton fixed-section content (Hero, Story, ...).
-- One row per section. fields JSONB holds per-section bilingual content,
-- e.g. { "headline": { "en": "...", "zh": "..." }, "image": { "path": "...", "alt_en": "...", "alt_zh": "..." } }.
-- The admin UI knows each section's expected field shape from a
-- declarative schema in src/lib/cms-schemas.ts.
-- ---------------------------------------------------------------------------
create table if not exists public.cms_sections (
  section_key  text primary key,
  page         text not null check (page in ('home', 'about', 'capabilities', 'trust')),
  fields       jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id)
);

create index if not exists cms_sections_page_idx on public.cms_sections (page);

-- ---------------------------------------------------------------------------
-- cms_groups — groups under a card section.
-- Multi-group sections (e.g. capabilities.customization) expose group CRUD;
-- single-group sections still get one implicit group, the admin UI just
-- hides group management for them.
-- Soft-deleted via active=false so accidental deletes can be undone.
-- ---------------------------------------------------------------------------
create table if not exists public.cms_groups (
  id           uuid primary key default gen_random_uuid(),
  section_key  text not null,
  title_en     text,
  title_zh     text,
  position     integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id)
);

create index if not exists cms_groups_section_idx on public.cms_groups (section_key, position);

-- ---------------------------------------------------------------------------
-- cms_cards — cards within a group.
-- image_path is the object key in the cms-images bucket; nullable so any
-- card section can opt out of imagery.
-- meta JSONB holds per-section extras (issuer/validity for credentials, etc.).
-- ---------------------------------------------------------------------------
create table if not exists public.cms_cards (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references public.cms_groups(id) on delete cascade,
  title_en        text,
  title_zh        text,
  description_en  text,
  description_zh  text,
  image_path      text,
  image_alt_en    text,
  image_alt_zh    text,
  position        integer not null default 0,
  active          boolean not null default true,
  meta            jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users(id)
);

create index if not exists cms_cards_group_idx on public.cms_cards (group_id, position);

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- Public reads: CMS content is rendered into public HTML anyway, so giving
-- anon SELECT keeps the marketing site off the service-role key while
-- preserving defense-in-depth against writes.
-- Soft-deleted rows are filtered out for public; admins see everything.
-- ---------------------------------------------------------------------------
alter table public.cms_sections enable row level security;
alter table public.cms_groups   enable row level security;
alter table public.cms_cards    enable row level security;

-- cms_sections: anyone reads, admins write
drop policy if exists "public can read cms_sections"  on public.cms_sections;
drop policy if exists "admins write cms_sections"     on public.cms_sections;

create policy "public can read cms_sections"
  on public.cms_sections for select
  to anon, authenticated
  using (true);

create policy "admins write cms_sections"
  on public.cms_sections for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- cms_groups: public reads only active rows; admins read everything; admins write
drop policy if exists "public can read active cms_groups"  on public.cms_groups;
drop policy if exists "admins can read all cms_groups"     on public.cms_groups;
drop policy if exists "admins write cms_groups"            on public.cms_groups;

create policy "public can read active cms_groups"
  on public.cms_groups for select
  to anon, authenticated
  using (active = true);

create policy "admins can read all cms_groups"
  on public.cms_groups for select
  to authenticated
  using (public.is_admin());

create policy "admins write cms_groups"
  on public.cms_groups for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- cms_cards: public reads only active cards under active groups; admins see all
drop policy if exists "public can read active cms_cards"  on public.cms_cards;
drop policy if exists "admins can read all cms_cards"     on public.cms_cards;
drop policy if exists "admins write cms_cards"            on public.cms_cards;

create policy "public can read active cms_cards"
  on public.cms_cards for select
  to anon, authenticated
  using (
    active = true
    and exists (
      select 1
      from public.cms_groups g
      where g.id = cms_cards.group_id
        and g.active = true
    )
  );

create policy "admins can read all cms_cards"
  on public.cms_cards for select
  to authenticated
  using (public.is_admin());

create policy "admins write cms_cards"
  on public.cms_cards for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants — explicit so a freshly-created Supabase project sees the right
-- privileges regardless of the project's default-privilege configuration.
-- ---------------------------------------------------------------------------
grant select
  on table public.cms_sections, public.cms_groups, public.cms_cards
  to anon, authenticated;

grant select, insert, update, delete
  on table public.cms_sections, public.cms_groups, public.cms_cards
  to authenticated;

grant all
  on table public.cms_sections, public.cms_groups, public.cms_cards
  to service_role;

-- ---------------------------------------------------------------------------
-- Storage bucket: cms-images (public).
-- Public-facing assets — factory photos, customization tiles, certificates.
-- The Supabase bucket-level public flag is what makes objects URL-readable
-- without auth; the SELECT policy below is for the authenticated API path.
-- Admin-only writes via is_admin().
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('cms-images', 'cms-images', true)
on conflict (id) do nothing;

drop policy if exists "public can read cms-images"     on storage.objects;
drop policy if exists "admins can insert cms-images"   on storage.objects;
drop policy if exists "admins can update cms-images"   on storage.objects;
drop policy if exists "admins can delete cms-images"   on storage.objects;

create policy "public can read cms-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cms-images');

create policy "admins can insert cms-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-images' and public.is_admin());

create policy "admins can update cms-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-images' and public.is_admin())
  with check (bucket_id = 'cms-images' and public.is_admin());

create policy "admins can delete cms-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-images' and public.is_admin());
