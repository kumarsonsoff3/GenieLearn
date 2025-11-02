import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats study time in minutes to a human-readable string
 * @param {number} totalMinutes - Total minutes to format
 * @returns {string} Formatted string (e.g., "25 min", "1h", "2h 15m")
 */
export function formatStudyTime(totalMinutes) {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}
