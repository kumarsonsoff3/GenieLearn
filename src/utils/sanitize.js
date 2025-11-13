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
 * Sanitize an object by escaping HTML in all string properties
 * @param {object} obj - The object to sanitize
 * @returns {object} - The sanitized object
 */
export const sanitizeObject = obj => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = escapeHtml(sanitized[key]);
    }
  }

  return sanitized;
};
