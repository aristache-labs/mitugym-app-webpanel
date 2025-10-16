# Gym Schedule API Documentation

## Overview
The Flutter app now fetches gym opening hours from the backend to display the traffic chart only during operating hours. This allows gym administrators to manage the schedule from the web panel, and the chart will automatically adjust.

## API Endpoint

### **GET** `/api/gym-schedule`

Fetches the gym schedule for a specific day of the week.

#### Query Parameters
- `api_key` (string, required) - API key for authentication
- `day` (string, required) - Day of the week in lowercase: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

#### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "schedule": {
    "id": "schedule-123",
    "day_of_week": "monday",
    "open_time": "06:00",
    "close_time": "22:00",
    "is_closed": false
  }
}
```

**Closed Day Response (200 OK):**
```json
{
  "success": true,
  "schedule": {
    "id": "schedule-124",
    "day_of_week": "sunday",
    "open_time": null,
    "close_time": null,
    "is_closed": true
  }
}
```

**Error Response (400/401/500):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

## Database Table: `gym_schedule`

The existing table structure:

```sql
CREATE TABLE gym_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL, -- 0=Monday, 1=Tuesday, ..., 6=Sunday
  open_time TIME, -- 24-hour format (e.g., '06:00:00')
  close_time TIME, -- 24-hour format (e.g., '22:00:00')
  is_active BOOLEAN DEFAULT TRUE, -- inverse of is_closed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  COMMENT ON COLUMN day_of_week IS '0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday'
);
```

**Note:** The API converts `is_active` to `is_closed` (inverse) for the response to match the Flutter app's expected format.

## Day of Week Mapping

**Database Format (day_of_week integer):**
- 0 = Monday
- 1 = Tuesday
- 2 = Wednesday
- 3 = Thursday
- 4 = Friday
- 5 = Saturday
- 6 = Sunday

**API Request Format (day parameter):**
- `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

**JavaScript Date.getDay() Format:**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

The API handles all conversions automatically.

## Expected Behavior

### Time Format
- Uses 24-hour format for times: `"HH:MM"` (e.g., `"06:00"`, `"22:00"`)
- Times are returned without seconds (HH:MM format)
- The app will parse the hour portion to determine operating hours

### Closed Days
- If `is_closed` is `true`, the chart will not show any data for that day
- `open_time` and `close_time` will be `null` when `is_closed` is `true`

### Overnight Schedules
- The app supports overnight schedules (e.g., `22:00` to `02:00`)
- If close time is earlier than open time, it's interpreted as crossing midnight

### Default Behavior
- If the API endpoint is not available or returns an error, the chart defaults to showing all 24 hours (00:00 - 23:00)
- If no schedule exists for a day, returns a closed schedule by default
- This ensures the app continues to work even if the schedule is not configured

### Caching
- Responses are cached for 5 minutes (`max-age=300`)
- This reduces database load while keeping schedule data reasonably fresh

## Example Usage

### Fetch Monday's Schedule
```bash
GET /api/gym-schedule?api_key=YOUR_API_KEY&day=monday
```

### Example Response
```json
{
  "success": true,
  "schedule": {
    "id": "f0453ffe-b4cb-4568-9ba8-d4032f28d961",
    "day_of_week": "monday",
    "open_time": "07:00",
    "close_time": "22:00",
    "is_closed": false
  }
}
```

## Testing

Use the provided PowerShell test script:

```powershell
# Set your API key
$env:CHECKIN_API_KEY = "your_api_key_here"

# Run the test script
.\test-gym-schedule.ps1
```

The test script will:
- Test all 7 days of the week
- Verify invalid day handling
- Verify API key authentication
- Display results in a formatted output

## Integration with Web Panel

The gym schedule can be managed through the web panel:

1. Navigate to **Schedule** page
2. Set operating hours for each day
3. Toggle days as open/closed
4. Changes sync automatically to the mobile app

The schedule editor shows:
- Visual day-by-day grid layout
- Time pickers for opening/closing hours
- Quick toggle for closed days
- Today's schedule highlighted

## Integration with Dashboard

### Timezone Support

The dashboard's "Today's Traffic" chart now properly respects the application's timezone settings:

1. **Timezone Configuration**: Administrators can configure the application timezone in **Settings > Timezone Settings**
2. **Automatic Conversion**: All check-in data is automatically converted to the configured timezone
3. **Accurate Display**: The chart shows data according to the gym's local time, not the browser's timezone

### How It Works

- The chart filters check-ins to show only today's data in the configured timezone
- Hours are displayed according to the gym's schedule in the configured timezone
- Current hour limiting works correctly regardless of where the user's browser is located

**Example:**
- If the gym is in Bucharest (UTC+3) and a user views from London (UTC+0)
- The chart will show Bucharest time (e.g., 14:00) not London time (e.g., 11:00)
- Check-ins at 14:00 Bucharest time appear at the correct hour on the chart

## Error Handling

### Authentication Errors
- **400 Bad Request**: Missing or invalid query parameters
- **401 Unauthorized**: Invalid or missing API key

### Server Errors
- **500 Internal Server Error**: Database connection issues or unexpected errors
- **503 Service Unavailable**: Database client not configured

All errors return a consistent JSON format with `success: false` and an `error` message.

## Security

- API key authentication required for all requests
- Uses the same `CHECKIN_API_KEY` environment variable as the check-in API
- No sensitive schedule data is exposed without authentication

## Future Enhancements

Potential improvements for future versions:

1. **Multi-location Support**: Support different schedules for different gym locations
2. **Special Hours**: Holiday schedules, special events, temporary closures
3. **Schedule History**: Track schedule changes over time
4. **Bulk Updates**: API endpoint to update multiple days at once
5. **Calendar Integration**: Export schedule to iCal format

## Files Modified

### New Files
- `src/app/api/gym-schedule/route.ts` - API endpoint implementation
- `test-gym-schedule.ps1` - PowerShell test script
- `docs/GYM_SCHEDULE_API.md` - This documentation

### Modified Files
- `src/app/(protected)/dashboard/page.tsx` - Pass timezone to OccupancyChart
- `src/components/dashboard/occupancy-chart.tsx` - Use timezone for proper date/time handling

## Support

For issues or questions:
1. Check the test script output for debugging
2. Verify the `CHECKIN_API_KEY` environment variable is set
3. Ensure the `gym_schedule` table has data for all days
4. Check the application timezone settings in the web panel
5. Review API logs in the Settings page for detailed error information

