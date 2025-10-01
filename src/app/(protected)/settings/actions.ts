"use server";

import { updateSetting } from "@/lib/settings";
import { clearTimezoneCache } from "@/lib/timezone";
import { AVAILABLE_TIMEZONES, TIME_FORMAT_OPTIONS, type TimeFormat } from "@/lib/settings";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { appendAuditLog } from "@/app/(protected)/lib/action-utils";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update the application timezone and time format settings
 */
export async function updateTimezoneAction(timezone: string, timeFormat: TimeFormat): Promise<ActionResult> {
  try {
    // Verify user is authenticated staff
    const staff = await requireStaff();

    // Validate timezone
    if (!timezone || typeof timezone !== 'string') {
      return { success: false, error: "Invalid timezone provided" };
    }

    // Check if timezone is in our allowed list
    const isValidTimezone = AVAILABLE_TIMEZONES.some(tz => tz.value === timezone);
    if (!isValidTimezone) {
      return { success: false, error: "Timezone not supported" };
    }

    // Check if time format is valid
    const isValidTimeFormat = TIME_FORMAT_OPTIONS.some(fmt => fmt.value === timeFormat);
    if (!isValidTimeFormat) {
      return { success: false, error: "Time format not supported" };
    }

    // Get the admin client
    const admin = getSupabaseAdmin();
    if (!admin) {
      return { success: false, error: "Database connection unavailable" };
    }

    // Get current timezone from database for audit log
    const { data: currentTzData } = await admin.rpc('show_timezone' as any);
    const oldTimezone = currentTzData?.[0]?.TimeZone || 'UTC';

    // Update the application timezone setting
    const timezoneSuccess = await updateSetting(
      'timezone', 
      timezone, 
      'Application timezone for date/time calculations and display'
    );

    // Update the time format setting
    const timeFormatSuccess = await updateSetting(
      'time_format',
      timeFormat,
      'Time display format (12-hour or 24-hour)'
    );

    if (!timezoneSuccess || !timeFormatSuccess) {
      return { success: false, error: "Failed to update settings" };
    }

    // Clear the timezone cache so the new setting takes effect immediately
    clearTimezoneCache();

    // Log the timezone and time format change in audit logs
    await appendAuditLog(
      staff.profile.id,
      'settings.display_update',
      'app_settings',
      '00000000-0000-0000-0000-000000000002', // System settings entity ID
      {
        timezone: { from: oldTimezone, to: timezone },
        time_format: timeFormat
      },
      'Display Settings',
      {
        settings_changed: {
          before: { timezone: oldTimezone },
          after: { timezone, time_format: timeFormat }
        }
      }
    );

    // Revalidate relevant paths to ensure fresh data
    revalidatePath('/settings');
    revalidatePath('/members');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to update timezone:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
