/**
 * Centralized timezone configuration for the application
 * This allows easy configuration for different countries/deployments
 * 
 * CONFIGURATION:
 * - Timezone is now stored in the database and can be changed via the Settings page
 * - Falls back to environment variable or Europe/Bucharest if not set
 * - Use the Settings page UI to change timezone for your deployment
 */

import { getSetting } from "@/lib/settings";

// Default timezone configuration (fallback)
const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'Europe/Bucharest';

// Cache for timezone setting to avoid repeated database calls
let cachedTimezone: string | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get the application's configured timezone
 * Reads from database settings with caching
 */
export async function getAppTimezone(): Promise<string> {
  const now = Date.now();
  
  // Return cached value if still valid
  if (cachedTimezone && now < cacheExpiry) {
    return cachedTimezone;
  }

  try {
    // Try to get timezone from database settings
    const timezone = await getSetting<string>('timezone');
    
    if (timezone) {
      // Update cache
      cachedTimezone = timezone;
      cacheExpiry = now + CACHE_DURATION;
      return timezone;
    }
  } catch (error) {
    console.warn('Failed to get timezone from settings, using default:', error);
  }

  // Fall back to default
  return DEFAULT_TIMEZONE;
}

/**
 * Clear the timezone cache (useful when settings are updated)
 */
export function clearTimezoneCache(): void {
  cachedTimezone = null;
  cacheExpiry = 0;
}

/**
 * Get the current time in the application's configured timezone
 */
export function getCurrentTime(): Date {
  return new Date();
}

/**
 * Get the current time as a timestamp in the application's timezone
 * This is useful for date comparisons
 */
export function getCurrentTimestamp(): number {
  return getCurrentTime().getTime();
}

/**
 * Get the timezone offset in milliseconds for the configured timezone
 * This is calculated dynamically based on the current date to handle DST
 */
export async function getTimezoneOffset(): Promise<number> {
  const timezone = await getAppTimezone();
  const now = new Date();
  
  // Create a date in the configured timezone
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  
  // Create a date in UTC
  const utcTime = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  
  // Return the difference in milliseconds
  return localTime.getTime() - utcTime.getTime();
}

/**
 * Get the current time adjusted for the application's timezone
 * This replaces the hardcoded "Romania time" calculations
 */
export async function getLocalizedTime(): Promise<Date> {
  const now = new Date();
  const offset = await getTimezoneOffset();
  return new Date(now.getTime() + offset);
}

/**
 * Get the current timestamp adjusted for the application's timezone
 * This replaces the hardcoded "Romania time" timestamp calculations
 */
export async function getLocalizedTimestamp(): Promise<number> {
  const localizedTime = await getLocalizedTime();
  return localizedTime.getTime();
}

/**
 * Check if a date expires within the given number of days
 * @param expiresAt - The expiration date string
 * @param days - Number of days to check (default: 7)
 * @returns true if expires within the specified days but hasn't expired yet
 */
export async function isExpiringWithinDays(expiresAt: string | null, days: number = 7): Promise<boolean> {
  if (!expiresAt) return false;
  
  const expires = new Date(expiresAt).getTime();
  const currentTime = await getLocalizedTimestamp();
  const timeWindow = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  // Check if expires within the specified days but hasn't expired yet
  return expires - currentTime <= timeWindow && expires > currentTime;
}

/**
 * Get a human-readable timezone name for display purposes
 */
export async function getTimezoneName(): Promise<string> {
  const timezone = await getAppTimezone();
  try {
    return Intl.DateTimeFormat('en', { 
      timeZone: timezone,
      timeZoneName: 'long'
    }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Format a date in the application's timezone
 */
export async function formatDateInTimezone(date: Date | string, options?: Intl.DateTimeFormatOptions): Promise<string> {
  const timezone = await getAppTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('en-US', {
    timeZone: timezone,
    ...options
  });
}
