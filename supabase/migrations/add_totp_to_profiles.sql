-- Add TOTP secret column to profiles table for rotating QR code security
-- Migration: add_totp_to_profiles
-- Created: 2025-10-01

-- Add totp_secret column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS totp_secret TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.totp_secret IS 'Base32-encoded TOTP secret for rotating QR code generation (160-bit entropy)';

-- Create index for faster lookups during check-in
CREATE INDEX IF NOT EXISTS idx_profiles_totp ON profiles(id, totp_secret) 
WHERE totp_secret IS NOT NULL;

-- Note: Existing members will have NULL totp_secret
-- Secrets will be generated when they first set up the mobile app
-- or can be batch-generated using the API endpoint

