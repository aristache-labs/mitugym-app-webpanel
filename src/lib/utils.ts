import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

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
  return format(new Date(Date.UTC(2024, 7, 4 + index)), "EEEE");
}

export function formatDuration(durationMonths: number | string): string {
  const months = Number(durationMonths);
  if (months === 0) return "1 day";
  return months === 1 ? "1 month" : `${months} months`;
}