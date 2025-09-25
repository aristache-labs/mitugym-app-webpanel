"use server";

import { updateSetting } from "@/lib/settings";
import { clearTimezoneCache } from "@/lib/timezone";
import { AVAILABLE_TIMEZONES } from "@/lib/settings";
import { requireStaff } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update the application timezone setting
 */
export async function updateTimezoneAction(timezone: string): Promise<ActionResult> {
  try {
    // Verify user is authenticated staff
    await requireStaff();

    // Validate timezone
    if (!timezone || typeof timezone !== 'string') {
      return { success: false, error: "Invalid timezone provided" };
    }

    // Check if timezone is in our allowed list
    const isValidTimezone = AVAILABLE_TIMEZONES.some(tz => tz.value === timezone);
    if (!isValidTimezone) {
      return { success: false, error: "Timezone not supported" };
    }

    // Update the setting in the database
    const success = await updateSetting(
      'timezone', 
      timezone, 
      'Application timezone for date/time calculations and display'
    );

    if (!success) {
      return { success: false, error: "Failed to update timezone setting" };
    }

    // Clear the timezone cache so the new setting takes effect immediately
    clearTimezoneCache();

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
