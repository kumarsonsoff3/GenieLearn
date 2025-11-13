/**
 * Sanitization utility to prevent XSS attacks
 * Escapes HTML special characters in user-generated content
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string with HTML characters escaped
 */
export const escapeHtml = str => {
  if (typeof str !== "string") return str;

  const htmlEscapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
};

/**
 * Recursively sanitize an object by escaping HTML in all string properties
 * Handles nested objects and arrays to prevent XSS in complex data structures
 * @param {*} data - The data to sanitize (object, array, string, or primitive)
 * @returns {*} - The sanitized data with the same structure
 */
export const sanitizeObject = data => {
  // Handle null and undefined
  if (data == null) return data;

  // Handle primitives
  if (typeof data === "string") {
    return escapeHtml(data);
  }

  // Handle non-object primitives (numbers, booleans, etc.)
  if (typeof data !== "object") {
    return data;
  }

  // Handle arrays recursively
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }

  // Handle objects recursively
  const sanitized = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(data[key]);
    }
  }

  return sanitized;
};
