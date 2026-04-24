-- ============================================================================
-- ICOMing storage — Phase 2
-- ============================================================================
-- Creates the private `inquiry-uploads` bucket used by the inquiry form's
-- file-upload feature (logos, design briefs, artwork, reference images).
--
-- Run after 0001_initial_schema.sql.
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Bucket: private (public: false) so nobody can list or download without
-- authenticated / service-role access. The API route issues signed URLs
-- to the admin dashboard (Phase 4).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('inquiry-uploads', 'inquiry-uploads', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS on storage.objects (Supabase already enables it).
--
-- Policy model:
--   - anon / authenticated: INSERT only (browser uploads via publishable key).
--   - No SELECT / UPDATE / DELETE policies for public → default-deny for
--     everyone except service_role (which bypasses RLS).
-- ---------------------------------------------------------------------------
drop policy if exists "public can upload inquiry attachments"
  on storage.objects;

create policy "public can upload inquiry attachments"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'inquiry-uploads');
