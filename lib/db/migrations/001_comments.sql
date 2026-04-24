-- Migration 001: Blog post comments
-- Run once: psql $DATABASE_URL -f lib/db/migrations/001_comments.sql

CREATE TABLE IF NOT EXISTS comments (
  id                BIGSERIAL PRIMARY KEY,
  post_slug         TEXT NOT NULL,                   -- post.urlPath without slashes, e.g. "2026/04/cms-smoke-test"
  author_name       TEXT NOT NULL,
  author_email      TEXT NOT NULL,                   -- never displayed publicly
  body              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','spam')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip                INET,
  user_agent        TEXT,
  cleantalk_verdict TEXT,                            -- 'allow' | 'block' | 'manual' | 'error'
  cleantalk_reason  TEXT,
  geo_country       CHAR(2),                         -- ISO 3166-1 alpha-2
  geo_city          TEXT
);

CREATE INDEX IF NOT EXISTS idx_comments_post_status
  ON comments (post_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_status_created
  ON comments (status, created_at DESC);
