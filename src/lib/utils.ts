import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import type { ScheduleDay, MemberStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "RON") {
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(value);
}

export function formatDate(value: string | null | undefined, fallback = "—") {
  if (!value) {
    return fallback;
  }
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch (error) {
    console.warn("Failed to format date", error);
    return fallback;
  }
}

export function formatDateTime(value: string | null | undefined, fallback = "—") {
  if (!value) {
    return fallback;
  }
  try {
    return format(parseISO(value), "MMM d, HH:mm");
  } catch (error) {
    console.warn("Failed to format datetime", error);
    return fallback;
  }
}

export function weekdayLabel(index: number) {
  // Frontend uses JS Date format: 0=Sunday, 1=Monday, ..., 6=Saturday
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[index] || "Unknown";
}

export function sortScheduleByWeekday(schedule: ScheduleDay[]): ScheduleDay[] {
  // Sort to show Monday-Sunday order
  return [...schedule].sort((a, b) => {
    const aOrder = a.weekday === 0 ? 7 : a.weekday; // Sunday becomes 7
    const bOrder = b.weekday === 0 ? 7 : b.weekday;
    return aOrder - bOrder;
  });
}

export function formatDuration(durationMonths: number | string): string {
  const months = Number(durationMonths);
  if (months === 0) return "1 day";
  return months === 1 ? "1 month" : `${months} months`;
}

export function calculateExpirationDate(startDate: string, durationMonths: number): string {
  const start = new Date(startDate);
  
  if (durationMonths === 0) {
    // 0 months = 1 day plan
    const expiration = new Date(start);
    expiration.setDate(expiration.getDate() + 1);
    return expiration.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } else {
    // Add months for monthly plans
    const expiration = new Date(start);
    expiration.setMonth(expiration.getMonth() + durationMonths);
    return expiration.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
}

export function calculateMemberStatus(storedStatus: string, startDate: string | null, expiresAt: string | null): MemberStatus {
  // Get current time in Romania timezone (UTC+3)
  const now = new Date();
  const romaniaTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours for UTC+3
  const today = new Date(romaniaTime);
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only in Romania timezone
  
  // If no start date, use the stored status
  if (!startDate) {
    return (storedStatus as MemberStatus) || 'active';
  }
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // If plan hasn't started yet (starts in the future), show as pending
  if (today < start) {
    return "pending";
  }
  
  // If plan has expired, show as inactive
  if (expiresAt) {
    const expires = new Date(expiresAt);
    // Set to end of expiration day in Romania timezone
    expires.setHours(23, 59, 59, 999);
    
    if (romaniaTime > expires) {
      return "inactive";
    }
  }
  
  // If plan has started (today or in the past) and hasn't expired, show as active
  if (today >= start) {
    // Check if it's a manual status like 'frozen' that should be preserved
    if (storedStatus === 'frozen') {
      return 'frozen';
    } else {
      return 'active';
    }
  }
  
  // Fallback to stored status or active
  return (storedStatus as MemberStatus) || 'active';
}