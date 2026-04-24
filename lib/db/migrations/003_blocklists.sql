-- Migration 003: Marissa-editable blocklists
-- Shared by both contact form (Phase 2) and comment submission (Phase 3).
-- Managed via /admin/blocklists/.

CREATE TABLE IF NOT EXISTS blocked_countries (
  country_code  CHAR(2) PRIMARY KEY,                -- ISO 3166-1 alpha-2 (e.g. 'PK','CN')
  reason        TEXT,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by      TEXT                                 -- GitHub login of whoever added it
);

CREATE TABLE IF NOT EXISTS blocked_ips (
  ip            INET PRIMARY KEY,
  reason        TEXT,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by      TEXT
);

CREATE TABLE IF NOT EXISTS blocked_keywords (
  id            SERIAL PRIMARY KEY,
  keyword       TEXT UNIQUE NOT NULL,                -- case-insensitive substring match
  reason        TEXT,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by      TEXT
);

-- Pre-seed the most common spam patterns. Marissa can add/remove via admin UI.
INSERT INTO blocked_countries (country_code, reason) VALUES
  ('PK','Persistent comment / form spam'),
  ('CN','Persistent comment / form spam'),
  ('IN','Persistent comment / form spam'),
  ('RU','Persistent comment / form spam')
ON CONFLICT (country_code) DO NOTHING;

INSERT INTO blocked_keywords (keyword, reason) VALUES
  ('viagra',            'pharma spam'),
  ('cialis',            'pharma spam'),
  ('seo services',      'SaaS pitch spam'),
  ('seo expert',        'SaaS pitch spam'),
  ('crypto investment', 'crypto scam'),
  ('forex trading',     'finance scam'),
  ('backlinks',         'link-building spam'),
  ('casino',            'gambling spam'),
  ('escort',            'adult spam'),
  ('replica watches',   'counterfeit spam')
ON CONFLICT (keyword) DO NOTHING;
