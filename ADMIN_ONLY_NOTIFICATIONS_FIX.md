# Admin-Only Notifications Fix

## Problem
The admin notifications (service purchases and session bookings) were appearing in both:
- ✅ Web admin panel (correct)
- ❌ Mobile app for members (incorrect)

Members were receiving notifications about their own purchases and bookings, which doesn't make sense.

## Solution
Added an `is_admin_only` column to the `notifications` table to distinguish between:
- **Admin notifications** - Only for web panel admins
- **Member notifications** - For mobile app members

## Changes Made

### 1. Database Schema Update

Added new column to `notifications` table:
```sql
ALTER TABLE public.notifications 
ADD COLUMN is_admin_only BOOLEAN DEFAULT false;
```

### 2. Updated Trigger Functions

Modified both trigger functions to set `is_admin_only = true`:

**`notify_admin_service_purchase()`**
```sql
INSERT INTO public.notifications (
  ...
  is_admin_only,
  ...
)
VALUES (
  ...
  true, -- ADMIN ONLY - mobile app should ignore this
  ...
);
```

**`notify_admin_session_booking()`**
```sql
INSERT INTO public.notifications (
  ...
  is_admin_only,
  ...
)
VALUES (
  ...
  true, -- ADMIN ONLY - mobile app should ignore this
  ...
);
```

### 3. Updated API Queries

Added `.eq("is_admin_only", true)` filter to all API endpoints:

- GET /api/notifications
- POST /api/notifications (mark as read)
- DELETE /api/notifications

### 4. Updated TypeScript Types

Added `is_admin_only` field to `AdminNotification` type:
```typescript
export type AdminNotification = {
  ...
  is_admin_only: boolean; // TRUE for admin-only notifications
  ...
};
```

## Mobile App Integration Guide

### What the Mobile App Should Do

When fetching notifications for members, **exclude** admin-only notifications:

```typescript
// ❌ OLD - Would include admin notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .or('member_id.eq.' + memberId + ',is_global.eq.true')
  .order('created_at', { ascending: false });

// ✅ NEW - Excludes admin notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .or('member_id.eq.' + memberId + ',and(is_global.eq.true,is_admin_only.eq.false)')
  .order('created_at', { ascending: false });
```

Or more explicitly:

```typescript
// Fetch member-specific notifications OR global non-admin notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .or(
    `member_id.eq.${memberId},` +
    `and(is_global.eq.true,is_admin_only.eq.false)`
  )
  .order('created_at', { ascending: false });
```

### Filter Logic Explanation

```
Member receives notification IF:
  (member_id = their_id) 
  OR 
  (is_global = true AND is_admin_only = false)

Member does NOT receive notification IF:
  is_admin_only = true
```

## Notification Types Breakdown

### Admin-Only Notifications (is_admin_only = true)
- `service_purchase` - Member purchased a service
- `session_booking` - Member booked a session

These appear ONLY in the web admin panel.

### Member Notifications (is_admin_only = false)
- `announcement` - New announcement published
- `gym_schedule_updated` - Gym hours changed
- `membership_expiring` - Membership about to expire (if implemented)
- Any other member-facing notifications

These appear in the mobile app.

## Database Structure

```
notifications table:
├── id: UUID
├── member_id: UUID (NULL for admin, specific ID for member)
├── type: VARCHAR (notification type)
├── title: VARCHAR
├── message: TEXT
├── reference_id: UUID
├── reference_type: VARCHAR
├── is_read: BOOLEAN
├── is_global: BOOLEAN (true = broadcast to multiple users)
├── is_admin_only: BOOLEAN (true = only for admin panel) ← NEW!
└── created_at: TIMESTAMP
```

## Query Examples

### Admin Panel (Web)
```sql
-- Fetch admin-only notifications
SELECT * FROM notifications
WHERE member_id IS NULL
  AND is_global = true
  AND is_admin_only = true
  AND type IN ('service_purchase', 'session_booking')
ORDER BY created_at DESC;
```

### Mobile App (Member)
```sql
-- Fetch member notifications (excluding admin-only)
SELECT * FROM notifications
WHERE (
  member_id = '123e4567-e89b-12d3-a456-426614174000'  -- specific member
  OR (is_global = true AND is_admin_only = false)    -- global but not admin-only
)
ORDER BY created_at DESC;
```

## Testing Checklist

### Web Admin Panel
- [x] Database column added
- [x] Triggers updated
- [x] API filters by is_admin_only = true
- [x] TypeScript types updated
- [ ] Test: Create service purchase → appears in web panel
- [ ] Test: Create session booking → appears in web panel

### Mobile App
- [ ] Update query to exclude is_admin_only = true notifications
- [ ] Test: Create service purchase → does NOT appear in mobile app
- [ ] Test: Create session booking → does NOT appear in mobile app
- [ ] Test: Announcements still appear in mobile app
- [ ] Test: Gym schedule updates still appear in mobile app

## Migration Files Applied

1. `add_is_admin_only_to_notifications.sql` - Added column and updated existing rows
2. `update_admin_notification_triggers_with_admin_only_flag.sql` - Updated trigger functions

## Summary

**Before:**
```
Service Purchase Notification:
├── Web Admin Panel: ✅ Shows
└── Mobile App (Member): ❌ Shows (WRONG!)
```

**After:**
```
Service Purchase Notification (is_admin_only = true):
├── Web Admin Panel: ✅ Shows
└── Mobile App (Member): ✅ Hidden (CORRECT!)
```

## Status
✅ **COMPLETE** - Admin-only notifications are now properly flagged and filtered. Mobile app just needs to update its query to respect the `is_admin_only` flag.

