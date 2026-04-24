-- Migration 002: Contact form submissions
-- Persists every contact form submission (sent + blocked) so Marissa can
-- audit the full history at /admin/inquiries/.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id                BIGSERIAL PRIMARY KEY,
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  email             TEXT NOT NULL,
  phone             TEXT,
  inquiry           TEXT,                            -- shipper / carrier / agent / driver / other
  body              TEXT NOT NULL,
  disposition       TEXT NOT NULL
                    CHECK (disposition IN (
                      'sent',
                      'blocked_country',
                      'blocked_ip',
                      'blocked_keyword',
                      'blocked_cleantalk',
                      'blocked_honeypot',
                      'blocked_turnstile',
                      'blocked_rate_limit',
                      'send_failed'
                    )),
  disposition_reason TEXT,                           -- e.g. matched keyword, CleanTalk reason
  ip                INET,
  user_agent        TEXT,
  geo_country       CHAR(2),
  geo_city          TEXT,
  cleantalk_verdict TEXT,
  cleantalk_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_disposition_created
  ON contact_submissions (disposition, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_created
  ON contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_geo_country
  ON contact_submissions (geo_country, created_at DESC);
