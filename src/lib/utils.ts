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

export function weekdayLabel(index: number) {
  return format(new Date(Date.UTC(2024, 7, 4 + index)), "EEEE");
}
