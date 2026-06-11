-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- Adds business info + contact columns to site_settings, and print_item to field type enum

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text;
