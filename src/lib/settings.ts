/**
 * Settings management service
 * Handles reading and writing application settings from the database
 */

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get a specific setting by key
 */
export async function getSetting<T = any>(key: string): Promise<T | null> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn("Supabase admin client not available for settings");
    return null;
  }

  const { data, error } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return null;
  }

  return data?.value || null;
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<AppSetting[]> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn("Supabase admin client not available for settings");
    return [];
  }

  const { data, error } = await admin
    .from('app_settings')
    .select('*')
    .order('key');

  if (error) {
    console.error('Failed to get settings:', error);
    return [];
  }

  return data || [];
}

/**
 * Update or create a setting
 */
export async function updateSetting(key: string, value: any, description?: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn("Supabase admin client not available for settings");
    return false;
  }

  const { error } = await admin
    .from('app_settings')
    .upsert({
      key,
      value,
      description,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Failed to update setting ${key}:`, error);
    return false;
  }

  return true;
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn("Supabase admin client not available for settings");
    return false;
  }

  const { error } = await admin
    .from('app_settings')
    .delete()
    .eq('key', key);

  if (error) {
    console.error(`Failed to delete setting ${key}:`, error);
    return false;
  }

  return true;
}

/**
 * Common timezone settings
 */
export const AVAILABLE_TIMEZONES = [
  { value: 'Europe/Bucharest', label: 'Romania (Europe/Bucharest)', country: '🇷🇴' },
  { value: 'Europe/London', label: 'United Kingdom (Europe/London)', country: '🇬🇧' },
  { value: 'Europe/Paris', label: 'France (Europe/Paris)', country: '🇫🇷' },
  { value: 'Europe/Berlin', label: 'Germany (Europe/Berlin)', country: '🇩🇪' },
  { value: 'Europe/Rome', label: 'Italy (Europe/Rome)', country: '🇮🇹' },
  { value: 'Europe/Madrid', label: 'Spain (Europe/Madrid)', country: '🇪🇸' },
  { value: 'America/New_York', label: 'US Eastern (America/New_York)', country: '🇺🇸' },
  { value: 'America/Chicago', label: 'US Central (America/Chicago)', country: '🇺🇸' },
  { value: 'America/Denver', label: 'US Mountain (America/Denver)', country: '🇺🇸' },
  { value: 'America/Los_Angeles', label: 'US Pacific (America/Los_Angeles)', country: '🇺🇸' },
  { value: 'America/Toronto', label: 'Canada Eastern (America/Toronto)', country: '🇨🇦' },
  { value: 'Asia/Tokyo', label: 'Japan (Asia/Tokyo)', country: '🇯🇵' },
  { value: 'Asia/Shanghai', label: 'China (Asia/Shanghai)', country: '🇨🇳' },
  { value: 'Asia/Seoul', label: 'South Korea (Asia/Seoul)', country: '🇰🇷' },
  { value: 'Asia/Singapore', label: 'Singapore (Asia/Singapore)', country: '🇸🇬' },
  { value: 'Australia/Sydney', label: 'Australia Eastern (Australia/Sydney)', country: '🇦🇺' },
  { value: 'Australia/Melbourne', label: 'Australia Eastern (Australia/Melbourne)', country: '🇦🇺' },
  { value: 'Australia/Perth', label: 'Australia Western (Australia/Perth)', country: '🇦🇺' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', country: '🌍' },
] as const;
