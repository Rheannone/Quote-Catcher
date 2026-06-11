-- Adds separate header background color to site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS header_bg_color text;
