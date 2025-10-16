-- Add status and denial_reason columns to checkins table
-- Migration: add_status_to_checkins
-- Created: 2025-10-16

-- Add status column with default 'success' and constraint
ALTER TABLE checkins 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'denied'));

-- Add denial_reason column for storing why access was denied
ALTER TABLE checkins 
ADD COLUMN IF NOT EXISTS denial_reason TEXT;

-- Add index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);

-- Add comment for documentation
COMMENT ON COLUMN checkins.status IS 'Status of check-in attempt: success or denied';
COMMENT ON COLUMN checkins.denial_reason IS 'Reason for denial if status is denied';

