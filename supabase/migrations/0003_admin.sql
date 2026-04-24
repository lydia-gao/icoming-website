-- ============================================================================
-- ICOMing admin — Phase 4
-- ============================================================================
-- Adds an allowlist of admin users (sales team) and the RLS plumbing so
-- authenticated admins can read/update inquiry data directly. Our API
-- routes use the service-role key today (bypassing RLS), so these
-- policies are defense-in-depth — they also keep the door open for
-- future client-side admin queries with user JWTs.
--
-- Run after 0002_storage_bucket.sql.
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- admin_users: allowlist of sales/admin emails that can sign in to /admin.
-- Magic-link auth flow lets anyone request a link, but the app checks
-- membership in this table before showing any admin surface.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text,
  role        text not null default 'sales'
              check (role in ('sales', 'admin')),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  notes       text  -- internal only (e.g. "left the team 2026-05-01")
);

create index if not exists admin_users_email_idx
  on public.admin_users (lower(email));

-- ---------------------------------------------------------------------------
-- is_admin() — checks the currently authenticated user's email against
-- admin_users. security definer so RLS on admin_users itself doesn't
-- block the function; marked stable since it doesn't mutate.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists(
    select 1
    from public.admin_users au
    where lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and au.active = true
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS on admin_users itself: only admins can read/write the table.
-- (Service role bypasses RLS, so it can seed new admins via the
-- dashboard/migration regardless.)
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;

drop policy if exists "admins read admin_users"   on public.admin_users;
drop policy if exists "admins write admin_users"  on public.admin_users;

create policy "admins read admin_users"
  on public.admin_users for select
  to authenticated
  using (public.is_admin());

create policy "admins write admin_users"
  on public.admin_users for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.admin_users to authenticated;
grant all on table public.admin_users to service_role;

-- ---------------------------------------------------------------------------
-- Admin read/update access on inquiries + line items + uploads.
-- Public insert policies from 0001 stay untouched — buyers can still
-- submit RFQs. These new policies layer on SELECT / UPDATE for
-- authenticated admins only.
-- ---------------------------------------------------------------------------
drop policy if exists "admins can read inquiries"        on public.inquiries;
drop policy if exists "admins can update inquiries"      on public.inquiries;
drop policy if exists "admins can read inquiry_items"    on public.inquiry_items;
drop policy if exists "admins can read inquiry_uploads"  on public.inquiry_uploads;

create policy "admins can read inquiries"
  on public.inquiries for select
  to authenticated
  using (public.is_admin());

create policy "admins can update inquiries"
  on public.inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can read inquiry_items"
  on public.inquiry_items for select
  to authenticated
  using (public.is_admin());

create policy "admins can read inquiry_uploads"
  on public.inquiry_uploads for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed — add initial admin emails here. Replace LYDIA_EMAIL with the
-- real personal email (kept as a placeholder row in case the migration
-- is applied before that value is known). Extra admins can be added via
-- the Supabase dashboard → Table Editor → admin_users → Insert, or by
-- running a SQL snippet:
--
--   insert into public.admin_users (email, full_name, role) values
--     ('new.sales@i-coming.com', 'New Salesperson', 'sales')
--   on conflict (email) do nothing;
-- ---------------------------------------------------------------------------
insert into public.admin_users (email, full_name, role)
values
  ('sale2@i-coming.com', 'Sales Team (sale2)', 'sales'),
  ('LYDIA_EMAIL_TODO@example.com', 'Lydia Gao', 'admin')
on conflict (email) do nothing;
