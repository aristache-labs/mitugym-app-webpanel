-- Fix session_bookings status constraint to include 'confirmed'
-- This migration updates the check constraint to match the application's expected status values

-- Drop the existing constraint if it exists
ALTER TABLE session_bookings 
DROP CONSTRAINT IF EXISTS session_bookings_status_check;

-- Add the updated constraint with all valid status values
ALTER TABLE session_bookings 
ADD CONSTRAINT session_bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'upcoming', 'completed', 'cancelled'));

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT session_bookings_status_check ON session_bookings 
IS 'Ensures status is one of: pending, confirmed, upcoming, completed, cancelled';
