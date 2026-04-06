-- Run this in your Supabase project → SQL Editor

create table public.quotes (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Contact
  first_name      text not null,
  last_name       text not null,
  company         text,
  email           text not null,
  phone           text not null,
  website         text,

  -- Project
  project_description text not null,
  deadline        date,
  fulfillment     text not null check (fulfillment in ('Pick-up', 'Shipping')),

  -- Shipping address (only required when fulfillment = 'Shipping')
  shipping_country   text,
  shipping_address1  text,
  shipping_address2  text,
  shipping_city      text,
  shipping_state     text,
  shipping_zip       text,

  -- Print specs
  what_printing   text not null,
  quantity        integer not null check (quantity > 0),
  print_locations text[] not null default '{}',
  other_print_location text,
  colors_front        text,
  colors_back         text,
  colors_left_sleeve  text,
  colors_right_sleeve text,
  apparel_brand   text not null,
  has_artwork     text not null check (has_artwork in ('Yes', 'No', 'In Progress')),
  additional_details text
);

-- Enable Row Level Security (always a good idea)
alter table public.quotes enable row level security;

-- Allow the API route (service role) to insert
-- Anon users can only insert (not read)
create policy "Anyone can submit a quote"
  on public.quotes
  for insert
  to anon
  with check (true);

-- Only authenticated users (or service role) can read
create policy "Service role can read all"
  on public.quotes
  for select
  to service_role
  using (true);
