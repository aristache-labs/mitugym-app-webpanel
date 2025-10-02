-- Migration: Update member status from 'inactive' to 'expired'
-- Date: 2025-10-02
-- Description: Replace all 'inactive' member statuses with 'expired' status

-- Update all profiles with status 'inactive' to 'expired'
UPDATE profiles
SET status = 'expired'
WHERE status = 'inactive';

-- Log the migration
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % member(s) from inactive to expired status', updated_count;
END $$;

