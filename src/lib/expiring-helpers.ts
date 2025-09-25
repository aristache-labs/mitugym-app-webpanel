/**
 * Helper functions for calculating expiring members
 * This ensures consistency between client and server-side calculations
 */

/**
 * Check if a member expires within the given number of days
 * Uses Romania timezone and date comparison to exactly match the backend logic
 */
export function isExpiringWithinDays(expiresAt: string | null, days: number = 7): boolean {
  if (!expiresAt) return false;
  
  // Get current date in Romania timezone (Europe/Bucharest)
  const now = new Date();
  // Use a more reliable method to get Romania timezone date
  const romaniaOffset = 3 * 60; // Romania is UTC+3 (accounting for DST if needed)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const romaniaTime = new Date(utc + (romaniaOffset * 60000));
  const romaniaToday = new Date(romaniaTime.getFullYear(), romaniaTime.getMonth(), romaniaTime.getDate());
  
  // Calculate week from today
  const weekFromToday = new Date(romaniaToday);
  weekFromToday.setDate(weekFromToday.getDate() + days);
  
  // Parse expiration date and reset to start of day for comparison
  const expirationDate = new Date(expiresAt);
  expirationDate.setHours(0, 0, 0, 0);
  
  // Match backend logic: expires_at::date >= romania_today AND expires_at::date <= week_from_today
  const isExpiring = expirationDate >= romaniaToday && expirationDate <= weekFromToday;
  
  return isExpiring;
}

/**
 * Get all expiring members from a list
 * Filters for active members only, matching backend logic
 */
export function getExpiringMembers<T extends { expires_at: string | null; status: string }>(
  members: T[], 
  days: number = 7
): T[] {
  return members.filter(member => 
    member.status === 'active' && // Only active members, matching backend logic
    isExpiringWithinDays(member.expires_at, days)
  );
}

/**
 * Debug function to log expiring member calculations
 */
export function debugExpiringCalculation(expiresAt: string | null, memberName: string = 'Unknown', status: string = 'unknown'): void {
  if (!expiresAt) {
    console.log(`${memberName}: No expiration date`);
    return;
  }
  
  // Use the same logic as the main function
  const now = new Date();
  const romaniaOffset = 3 * 60; // Romania is UTC+3 
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const romaniaTime = new Date(utc + (romaniaOffset * 60000));
  const romaniaToday = new Date(romaniaTime.getFullYear(), romaniaTime.getMonth(), romaniaTime.getDate());
  
  const weekFromToday = new Date(romaniaToday);
  weekFromToday.setDate(weekFromToday.getDate() + 7);
  
  const expirationDate = new Date(expiresAt);
  expirationDate.setHours(0, 0, 0, 0);
  
  const isExpiring = expirationDate >= romaniaToday && expirationDate <= weekFromToday;
  const isActive = status === 'active';
  const wouldBeIncluded = isActive && isExpiring;
  
  const daysDiff = Math.ceil((expirationDate.getTime() - romaniaToday.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log(`${memberName}:`, {
    status,
    expires_at: expiresAt,
    romania_today: romaniaToday.toISOString().split('T')[0],
    week_from_today: weekFromToday.toISOString().split('T')[0],
    expiration_date: expirationDate.toISOString().split('T')[0],
    days_until_expiry: daysDiff,
    is_active: isActive,
    is_expiring: isExpiring,
    would_be_included: wouldBeIncluded
  });
}
