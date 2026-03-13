import type { ObservabilityError, ObservabilityMetric, SanitizationConfig } from '@/types/observability'

/**
 * Common PII patterns to redact from strings
 */
const PII_PATTERNS = [
  // SSN patterns (XXX-XX-XXXX, XXXXXXXXX)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN-REDACTED]' },
  { pattern: /\b\d{9}\b/g, replacement: '[SSN-REDACTED]' },
  
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL-REDACTED]' },
  
  // Phone numbers (various formats)
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[PHONE-REDACTED]' },
  { pattern: /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g, replacement: '[PHONE-REDACTED]' },
  
  // Credit card numbers (basic pattern)
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CC-REDACTED]' },
  
  // API keys and tokens (common patterns)
  { pattern: /\b[A-Za-z0-9_-]{32,}\b/g, replacement: '[TOKEN-REDACTED]' },
]

/**
 * Fields that commonly contain sensitive data and should be removed
 */
const SENSITIVE_FIELD_NAMES = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'ssn',
  'social_security_number',
  'creditCard',
  'credit_card',
  'cvv',
  'pin',
  'bankAccount',
  'bank_account',
  'routingNumber',
  'routing_number',
  'accountNumber',
  'account_number',
]

/**
 * Sanitizes a string by replacing PII patterns with redacted placeholders
 */
export function sanitizeString(value: string): string {
  let sanitized = value
  
  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement)
  }
  
  return sanitized
}

/**
 * Recursively sanitizes an object by:
 * 1. Removing sensitive field names
 * 2. Redacting PII patterns in string values
 */
export function sanitizeObject(
  obj: unknown,
  additionalSensitiveFields: string[] = [],
): unknown {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, additionalSensitiveFields))
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {}
    
    // Combine default and additional sensitive fields for this call only
    const allSensitiveFields = [...SENSITIVE_FIELD_NAMES, ...additionalSensitiveFields]
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields entirely
      if (allSensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]'
        continue
      }
      
      sanitized[key] = sanitizeObject(value, additionalSensitiveFields)
    }
    
    return sanitized
  }

  return obj
}

/**
 * Sanitizes an ObservabilityError to remove PII
 */
export function sanitizeError(
  error: ObservabilityError,
  config: SanitizationConfig = {},
): ObservabilityError {
  const {
    enabled = true,
    includeOriginalError = false,
    customErrorSanitizer,
    additionalSensitiveFields = [],
  } = config

  // If custom sanitizer is provided, use it
  if (customErrorSanitizer) {
    return customErrorSanitizer(error)
  }

  // If sanitization is disabled, return as-is but still respect includeOriginalError
  if (!enabled) {
    return includeOriginalError ? error : { ...error, originalError: undefined }
  }

  // Sanitize the error, passing additionalSensitiveFields to sanitizeObject
  const sanitized: ObservabilityError = {
    ...error,
    message: sanitizeString(error.message),
    stack: error.stack ? sanitizeString(error.stack) : undefined,
    context: sanitizeObject(error.context, additionalSensitiveFields) as ObservabilityError['context'],
    originalError: includeOriginalError ? error.originalError : undefined,
  }

  return sanitized
}

/**
 * Sanitizes an ObservabilityMetric to remove PII
 */
export function sanitizeMetric(
  metric: ObservabilityMetric,
  config: SanitizationConfig = {},
): ObservabilityMetric {
  const { enabled = true, customMetricSanitizer, additionalSensitiveFields = [] } = config

  // If custom sanitizer is provided, use it
  if (customMetricSanitizer) {
    return customMetricSanitizer(metric)
  }

  // If sanitization is disabled, return as-is
  if (!enabled) {
    return metric
  }

  // Sanitize metric tags (in case they contain dynamic values), passing additionalSensitiveFields
  const sanitized: ObservabilityMetric = {
    ...metric,
    tags: metric.tags
      ? (sanitizeObject(metric.tags, additionalSensitiveFields) as Record<string, string>)
      : undefined,
  }

  return sanitized
}
