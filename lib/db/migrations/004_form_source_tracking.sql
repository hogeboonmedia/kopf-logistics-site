-- Migration 004: Per-source form tracking
--
-- Each new audience-specific form (Agent, Shipper, Driver, plus the existing
-- general Contact form) writes into the same `contact_submissions` table but
-- tags itself with a `source`. Audience-specific extra fields (truck type,
-- company name, employment type, etc.) live in a JSONB `extra_fields` column
-- so the schema doesn't have to change every time a form gets a new question.
--
-- Marissa's /admin/inquiries dashboard reads `source` to filter / count
-- submissions by which form they came from.

ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'contact';

ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS extra_fields JSONB DEFAULT '{}'::JSONB;

-- Whitelist the four valid sources. Add new ones here as we add forms.
ALTER TABLE contact_submissions
  DROP CONSTRAINT IF EXISTS chk_source;
ALTER TABLE contact_submissions
  ADD CONSTRAINT chk_source CHECK (source IN ('contact','agent','shippers','drivers'));

-- Indexed source so /admin/inquiries can filter quickly without a table scan.
CREATE INDEX IF NOT EXISTS idx_submissions_source_created
  ON contact_submissions (source, created_at DESC);
