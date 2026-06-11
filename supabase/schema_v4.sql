-- Run in Supabase SQL Editor
-- Adds form headline, subtitle, and header layout style to site_settings

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS form_headline      text,
  ADD COLUMN IF NOT EXISTS form_subtitle_html text,
  ADD COLUMN IF NOT EXISTS header_style       text DEFAULT 'bar-left';
