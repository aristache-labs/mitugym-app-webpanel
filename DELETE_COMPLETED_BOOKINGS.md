# Delete Button for Completed Bookings

## Changes Made

### 1. Updated Delete Action
**File:** `src/app/(protected)/services/session-booking-actions.ts`

Modified `deleteSessionBookingAction` to allow deletion of both cancelled and completed bookings:

**Before:**
```typescript
// Only allow deletion of cancelled bookings
if (existingBooking.status !== "cancelled") {
  return { success: false, error: "Only cancelled bookings can be deleted" };
}
```

**After:**
```typescript
// Only allow deletion of cancelled or completed bookings
if (existingBooking.status !== "cancelled" && existingBooking.status !== "completed") {
  return { success: false, error: "Only cancelled or completed bookings can be deleted" };
}
```

### 2. Updated UI to Show Delete Button
**File:** `src/app/(protected)/bookings/session-bookings-table.tsx`

Modified the delete button visibility condition:

**Before:**
```tsx
{/* Delete Button for cancelled bookings */}
{booking.status === "cancelled" && (
```

**After:**
```tsx
{/* Delete Button for cancelled and completed bookings */}
{(booking.status === "cancelled" || booking.status === "completed") && (
```

Also updated the button title to dynamically show the booking status:
```tsx
title={`Delete ${booking.status} booking`}
```

## Features

The delete button now appears for:
- ✅ **Cancelled bookings** - as before
- ✅ **Completed bookings** - newly added

The delete button will NOT appear for:
- ❌ Pending bookings
- ❌ Confirmed bookings  
- ❌ Upcoming bookings

## User Experience

1. Staff can now clean up completed bookings after they're no longer needed
2. The delete button appears with the same red styling for both cancelled and completed bookings
3. A confirmation modal will appear before deletion with full booking details
4. The action is permanent and will remove the booking from the system
5. An audit log entry will be created when a booking is deleted

## Rationale

Allowing deletion of completed bookings helps with:
- Data cleanup and maintenance
- Removing old/historical bookings that are no longer needed
- Managing database size
- Correcting mistakes where a booking was marked as completed by error

Active bookings (pending, confirmed, upcoming) still cannot be deleted - they must first be cancelled or completed before deletion is allowed.
