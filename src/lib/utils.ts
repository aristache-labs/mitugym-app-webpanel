import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import type { ScheduleDay } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
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