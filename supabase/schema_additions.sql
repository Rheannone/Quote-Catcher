-- ─────────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor AFTER the original schema.sql
-- ─────────────────────────────────────────────────────────────

-- 1. Site appearance settings (singleton row)
create table if not exists public.site_settings (
  id           integer primary key default 1,
  brand_color  text not null default '#1a1a2e',
  accent_color text not null default '#e94560',
  font_family  text not null default 'Inter',
  logo_url     text,
  constraint site_settings_single_row check (id = 1)
);

-- Seed the single settings row
insert into public.site_settings (id) values (1) on conflict do nothing;

alter table public.site_settings enable row level security;

create policy "Service role can manage settings"
  on public.site_settings for all to service_role
  using (true) with check (true);

-- 2. Custom form fields
create table if not exists public.custom_fields (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  label       text not null,
  field_type  text not null check (field_type in ('text', 'textarea', 'select', 'checkbox', 'number')),
  required    boolean not null default false,
  options     jsonb,          -- for 'select' type: ["Option A", "Option B"]
  sort_order  integer not null default 0,
  active      boolean not null default true
);

alter table public.custom_fields enable row level security;

create policy "Service role can manage custom fields"
  on public.custom_fields for all to service_role
  using (true) with check (true);

-- 3. Add custom field responses column to quotes
alter table public.quotes
  add column if not exists custom_fields_data jsonb;

-- 4. Supabase Storage bucket for logos (public read)
insert into storage.buckets (id, name, public)
  values ('logos', 'logos', true)
  on conflict do nothing;

create policy "Public logo read"
  on storage.objects for select to public
  using (bucket_id = 'logos');

create policy "Service role logo upload"
  on storage.objects for insert to service_role
  with check (bucket_id = 'logos');

create policy "Service role logo delete"
  on storage.objects for delete to service_role
  using (bucket_id = 'logos');
