/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and cleans user input
 */

/**
 * Sanitize string input by removing HTML tags, control characters, and trimming whitespace
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== "string") return input;

  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-printable characters (keep newlines, returns, tabs)
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
};

/**
 * Sanitize title specifically
 * More restrictive than general string sanitization
 * @param title - The title to sanitize
 * @returns Sanitized title
 */
export const sanitizeTitle = (title: string): string => {
  if (typeof title !== "string") return title;

  return title
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>{}[\]\\]/g, "") // Remove potentially dangerous characters
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
};

/**
 * Sanitize description with allowed markdown-like formatting
 * @param description - The description to sanitize
 * @returns Sanitized description
 */
export const sanitizeDescription = (description: string): string => {
  if (typeof description !== "string") return description;

  return description
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
};

/**
 * Detect potential SQL injection patterns
 * @param input - The input to check
 * @returns true if suspicious patterns detected
 */
export const hasSqlInjectionPattern = (input: string): boolean => {
  if (typeof input !== "string") return false;

  const sqlPatterns = [
    /(\bselect\b.*\bfrom\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bupdate\b.*\bset\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\bunion\b.*\bselect\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
};

/**
 * Detect potential XSS patterns
 * @param input - The input to check
 * @returns true if suspicious patterns detected
 */
export const hasXssPattern = (input: string): boolean => {
  if (typeof input !== "string") return false;

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
};

/**
 * Validate and sanitize input object
 * Applies sanitization to all string fields recursively
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};
