-- Fix announcement notification trigger to use correct column name
-- The trigger was referencing 'status' which doesn't exist in the announcements table
-- The correct column name is 'is_active'

CREATE OR REPLACE FUNCTION notify_new_announcement()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on INSERT of active announcements OR
  -- Notify on UPDATE when is_active changes to true
  IF (TG_OP = 'INSERT' AND NEW.is_active = true) OR
     (TG_OP = 'UPDATE' AND (OLD.is_active IS NULL OR OLD.is_active = false) AND NEW.is_active = true) THEN
    -- Create ONE global notification for all members
    -- Strip HTML tags from content for notification message using regexp_replace
    INSERT INTO public.notifications (member_id, type, title, message, reference_id, reference_type, is_global)
    VALUES (
      NULL,
      'announcement',
      'New Announcement',
      LEFT(regexp_replace(NEW.content, '<[^>]*>', '', 'g'), 100) || CASE WHEN LENGTH(regexp_replace(NEW.content, '<[^>]*>', '', 'g')) > 100 THEN '...' ELSE '' END,
      NEW.id,
      'announcement',
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notify_new_announcement() 
IS 'Trigger function that creates a global notification when announcements are created or activated. Fixed to use announcements.is_active instead of non-existent announcements.status column.';
