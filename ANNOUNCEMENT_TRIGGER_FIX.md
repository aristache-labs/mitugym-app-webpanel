# Announcement Trigger Fix

## Issue
When trying to create or update news announcements, the following error occurred:
```
new record "new" has no field "status"
```

## Root Cause
The database trigger function `notify_new_announcement()` was referencing an incorrect column name. The trigger runs whenever announcements are inserted or updated and attempts to create notifications for members.

**The Problem:**
- The trigger function was checking: `NEW.status = 'published'` and `OLD.status != 'published'`
- But the `announcements` table doesn't have a column named `status`
- The correct column name is `is_active` (boolean field)

## Fix Applied

Updated the trigger function to use the correct column name and strip HTML tags from content:

```sql
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
```

## Changes Made

**Before (incorrect):**
- Checked `NEW.status = 'published'`
- Checked `OLD.status != 'published'`

**After (correct):**
- Checks `NEW.is_active = true` ✅
- Checks `OLD.is_active IS NULL OR OLD.is_active = false` ✅
- Strips HTML tags from content using `regexp_replace` for clean notification messages ✅

## Migration
A migration file has been created at:
`supabase/migrations/fix_announcement_trigger_column_reference.sql`

## What the Trigger Does
When an announcement is created or activated:
1. The trigger function `notify_new_announcement()` is executed
2. If the announcement is active (`is_active = true`), it creates a global notification
3. The notification is sent to all members (via `member_id = NULL` and `is_global = true`)
4. Members see "New Announcement" in their notification feed in the mobile app

## Testing
After this fix:
1. ✅ You can now create new announcements without errors
2. ✅ You can activate/deactivate announcements without errors  
3. ✅ Members will receive notifications when new active announcements are published
4. ✅ The notification system works correctly with the `announcements.is_active` column

## Related Tables
- `announcements` - Contains news and announcements with the `is_active` boolean column
- `notifications` - Stores notifications sent to members
- `profiles` - Contains member information
