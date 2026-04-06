-- Run this in your Supabase SQL editor
-- Adds: section grouping, placeholder text, field_key (internal name), user_id scoping

-- custom_fields: new columns
ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS section      text NOT NULL DEFAULT 'additional';
ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS placeholder  text;
ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS field_key    text; -- e.g. "firstName"

-- Ensure user_id exists (may already be added by schema_auth.sql)
ALTER TABLE custom_fields ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- site_settings: per-user settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
-- Add unique constraint only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_user_id_key'
  ) THEN
    ALTER TABLE site_settings ADD CONSTRAINT site_settings_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- quotes: tag which admin owns each submission
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);

-- Indexes
CREATE INDEX IF NOT EXISTS cf_user_section_order_idx ON custom_fields(user_id, section, sort_order);
