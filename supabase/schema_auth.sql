-- ─────────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor AFTER schema_additions.sql
-- Adds user_id columns for future multi-tenancy (SaaS-ready)
-- ─────────────────────────────────────────────────────────────

-- 1. Tag site_settings rows by owner (nullable for now — single-tenant uses row id=1)
alter table public.site_settings
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. Tag custom_fields by creator
alter table public.custom_fields
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 3. Tag quotes by which form/owner they were submitted to
alter table public.quotes
  add column if not exists form_owner_id uuid references auth.users(id) on delete set null;

-- 4. Update RLS on custom_fields:
--    Authenticated users can read all active fields (needed for the public form to read them)
--    Service role can do everything (used by API routes)
drop policy if exists "Service role can manage custom fields" on public.custom_fields;

create policy "Service role manages custom fields"
  on public.custom_fields for all to service_role
  using (true) with check (true);

create policy "Anon can read active fields"
  on public.custom_fields for select to anon
  using (active = true);

-- 5. Update RLS on site_settings:
--    Anon can read (needed for layout.tsx to fetch settings for the public form)
drop policy if exists "Service role can manage settings" on public.site_settings;

create policy "Service role manages settings"
  on public.site_settings for all to service_role
  using (true) with check (true);

create policy "Anon can read settings"
  on public.site_settings for select to anon
  using (true);
