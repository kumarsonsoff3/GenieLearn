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

/**
 * Formats a timestamp into a human-readable relative time string
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Relative time string (e.g., "Just now", "5m ago", "Yesterday")
 */
export function getTimeAgo(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Compares two arrays for equality (order-independent)
 * @param {Array} arr1 - First array to compare
 * @param {Array} arr2 - Second array to compare
 * @returns {boolean} True if arrays contain the same elements (regardless of order)
 */
export function arraysEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  // Sort both arrays for order-independent comparison
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((value, index) => value === sorted2[index]);
}

/**
 * Get file type information for displaying file icons
 * Returns icon type and emoji representation for consistent file display
 * @param {string} fileType - MIME type or file type string
 * @returns {object} Object with iconType and emoji properties
 */
export function getFileTypeInfo(fileType) {
  if (!fileType) {
    return { iconType: "file", emoji: "📎" };
  }

  const type = fileType.toLowerCase();

  if (type.includes("image")) {
    return { iconType: "image", emoji: "🖼️" };
  }
  if (type.includes("pdf")) {
    return { iconType: "pdf", emoji: "📄" };
  }
  if (type.includes("video")) {
    return { iconType: "video", emoji: "🎥" };
  }
  if (type.includes("audio")) {
    return { iconType: "audio", emoji: "🎵" };
  }
  if (
    type.includes("text") ||
    type.includes("code") ||
    type.includes("javascript") ||
    type.includes("json")
  ) {
    return { iconType: "code", emoji: "📝" };
  }
  if (type.includes("word") || type.includes("document")) {
    return { iconType: "document", emoji: "📘" };
  }
  if (type.includes("excel") || type.includes("spreadsheet")) {
    return { iconType: "spreadsheet", emoji: "📊" };
  }
  if (type.includes("powerpoint") || type.includes("presentation")) {
    return { iconType: "presentation", emoji: "📽️" };
  }
  if (type.includes("zip") || type.includes("rar") || type.includes("tar")) {
    return { iconType: "archive", emoji: "📦" };
  }

  return { iconType: "file", emoji: "📎" };
}
