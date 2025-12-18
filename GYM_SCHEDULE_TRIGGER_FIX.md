# Gym Schedule Trigger Fix

## Issue
When trying to save changes to the gym schedule, the following error occurred:
```
column "membership_status" does not exist
```

## Root Cause
The database trigger function `notify_gym_schedule_update()` was referencing an incorrect column name. The trigger runs whenever the gym schedule is updated and attempts to notify all active members.

**The Problem:**
- The trigger function was querying: `SELECT id FROM profiles WHERE membership_status = 'active'`
- But the `profiles` table doesn't have a column named `membership_status`
- The correct column name is `status`

## Fix Applied

Updated the trigger function to use the correct column name:

```sql
CREATE OR REPLACE FUNCTION notify_gym_schedule_update()
RETURNS TRIGGER AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Notify all active members about gym schedule changes
  FOR member_record IN 
    SELECT id FROM profiles WHERE status = 'active'  -- ✅ Fixed: was membership_status
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
```

## Migration
A migration file has been created at:
`supabase/migrations/fix_gym_schedule_trigger_column_reference.sql`

## What the Trigger Does
When the gym schedule is updated (INSERT, UPDATE on `gym_schedule` table):
1. The trigger function `notify_gym_schedule_update()` is executed
2. It finds all members with `status = 'active'`
3. Creates a notification for each active member about the schedule change
4. The notification appears in the member's notification list in the app

## Testing
After this fix:
1. ✅ You can now save changes to the gym schedule without errors
2. ✅ Active members will receive notifications when the schedule is updated
3. ✅ The notification system works correctly with the `profiles.status` column

## Related Tables
- `gym_schedule` - Contains gym operating hours by day of week
- `profiles` - Contains member information including the `status` column
- `notifications` - Stores notifications sent to members
