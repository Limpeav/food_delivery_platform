-- =========================================================================
-- V4__unique_user_phone_number.sql
-- Enforce uniqueness of user phone numbers across accounts.
-- 1. Clears all existing phone numbers so every user must enter/verify a unique number.
-- 2. Adds a UNIQUE partial index on non-null phone numbers.
-- =========================================================================

-- 1. Clear all user phone numbers and verification timestamps
UPDATE users
SET phone_number = NULL,
    phone_verified = FALSE,
    phone_verified_at = NULL;

-- 2. Create unique index for user phone numbers (allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone_number ON users (phone_number)
    WHERE phone_number IS NOT NULL;
