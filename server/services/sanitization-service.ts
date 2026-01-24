/**
 * Input Sanitization Service
 * Protects against XSS, SQL injection, and other input-based attacks
 */

// HTML entities to escape
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe database storage
 * Removes potential SQL injection patterns
 */
export function sanitizeForDb(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  // Remove common SQL injection patterns
  let sanitized = str
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE|TRUNCATE)\b/gi, ''); // Remove SQL keywords
  
  return sanitized.trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  // Basic email sanitization
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, ''); // Remove potentially dangerous characters
}

/**
 * Sanitize phone number (keep only digits and common separators)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  // Only allow http, https, and relative URLs
  const trimmed = url.trim();
  if (trimmed.startsWith('javascript:') || 
      trimmed.startsWith('data:') || 
      trimmed.startsWith('vbscript:')) {
    return '';
  }
  
  // Remove any script tags
  return trimmed.replace(/<script[^>]*>.*?<\/script>/gi, '');
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return '';
  
  // Remove path traversal attempts and special characters
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid filename characters
    .trim();
}

/**
 * Sanitize JSON string
 */
export function sanitizeJson(jsonStr: string): string {
  if (!jsonStr || typeof jsonStr !== 'string') return '{}';
  
  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = escapeHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? escapeHtml(item) : 
        typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : 
        item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validate and sanitize common input types
 */
export const validators = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Validate phone number format (basic)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d+\-\s()]{8,20}$/;
    return phoneRegex.test(phone);
  },
  
  /**
   * Validate UUID format
   */
  isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  /**
   * Validate integer
   */
  isValidInteger(value: unknown): boolean {
    return Number.isInteger(Number(value));
  },
  
  /**
   * Validate positive number
   */
  isPositiveNumber(value: unknown): boolean {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },
  
  /**
   * Validate date string
   */
  isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  },
  
  /**
   * Check for potential XSS patterns
   */
  containsXss(str: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick=, onload=, etc.
      /data:/i,
      /vbscript:/i,
      /<iframe/i,
      /<embed/i,
      /<object/i,
    ];
    
    return xssPatterns.some(pattern => pattern.test(str));
  },
  
  /**
   * Check for potential SQL injection patterns
   */
  containsSqlInjection(str: string): boolean {
    const sqlPatterns = [
      /'\s*OR\s+/i,
      /'\s*AND\s+/i,
      /UNION\s+SELECT/i,
      /DROP\s+TABLE/i,
      /DELETE\s+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+\w+\s+SET/i,
      /--/,
      /\/\*/,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(str));
  },
};

/**
 * Middleware function to sanitize request body
 */
export function sanitizeRequestBody(body: Record<string, unknown>): Record<string, unknown> {
  return sanitizeObject(body);
}

export default {
  escapeHtml,
  stripHtml,
  sanitizeForDb,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeJson,
  sanitizeObject,
  sanitizeRequestBody,
  validators,
};
