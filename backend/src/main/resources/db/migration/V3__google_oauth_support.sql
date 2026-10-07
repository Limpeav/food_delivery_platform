-- =========================================================================
-- V3__google_oauth_support.sql
-- Google OAuth / Social Login support for Cravery
-- Makes password nullable (Google users have no password),
-- adds google_subject, profile_image_url, phone_verified columns
-- if they were not already created by Hibernate ddl-auto.
-- =========================================================================

-- 1. Make password nullable to support social-only (Google) accounts
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Add google_subject column if not exists (unique index for fast lookup)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_subject VARCHAR(255) UNIQUE;

-- 3. Add profile_image_url column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(1000);

-- 4. Add phone_verified column if not exists (defaults to false)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Add phone_verified_at column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;

-- 6. Index for Google subject lookups (fast OAuth sign-in)
CREATE INDEX IF NOT EXISTS idx_users_google_subject ON users (google_subject)
    WHERE google_subject IS NOT NULL;

-- 7. Index for email-based lookups (already unique but explicit index helps planner)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
