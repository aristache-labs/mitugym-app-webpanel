-- Fix gym schedule notification trigger to use correct column name
-- The trigger was referencing 'membership_status' which doesn't exist in the profiles table
-- The correct column name is 'status'

CREATE OR REPLACE FUNCTION notify_gym_schedule_update()
RETURNS TRIGGER AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Notify all active members about gym schedule changes
  FOR member_record IN 
    SELECT id FROM profiles WHERE status = 'active'
  LOOP
    INSERT INTO public.notifications (member_id, type, title, message, reference_id, reference_type)
    VALUES (
      member_record.id,
      'gym_schedule_updated',
      'Gym Schedule Updated',
      'The gym schedule has been updated. Please check the home page for the latest hours.',
      NEW.id,
      'gym_schedule'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_gym_schedule_update() 
IS 'Trigger function that notifies active members when gym schedule is updated. Fixed to use profiles.status instead of non-existent profiles.membership_status column.';
