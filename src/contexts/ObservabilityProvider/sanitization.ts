import type {
  ObservabilityError,
  ObservabilityMetric,
  SanitizationConfig,
} from '@/types/observability'

const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN-REDACTED]' },
  { pattern: /\b\d{9}\b/g, replacement: '[SSN-REDACTED]' },
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL-REDACTED]',
  },
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[PHONE-REDACTED]' },
  { pattern: /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g, replacement: '[PHONE-REDACTED]' },
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CC-REDACTED]' },
  { pattern: /\b[A-Za-z0-9_-]{32,}\b/g, replacement: '[TOKEN-REDACTED]' },
]

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

export function sanitizeString(value: string): string {
  let sanitized = value

  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement)
  }

  return sanitized
}

export function sanitizeObject(obj: unknown, additionalSensitiveFields: string[] = []): unknown {
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

    const allSensitiveFields = [...SENSITIVE_FIELD_NAMES, ...additionalSensitiveFields]

    for (const [key, value] of Object.entries(obj)) {
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

export function sanitizeError(
  error: ObservabilityError,
  config: SanitizationConfig = {},
): ObservabilityError {
  const {
    enabled = true,
    includeRawError = false,
    customErrorSanitizer,
    additionalSensitiveFields = [],
  } = config

  if (customErrorSanitizer) {
    return customErrorSanitizer(error)
  }

  if (!enabled) {
    return includeRawError ? error : { ...error, raw: undefined }
  }

  const sanitizedFieldErrors = error.fieldErrors.map(fe => ({
    ...fe,
    message: sanitizeString(fe.message),
    metadata: fe.metadata
      ? (sanitizeObject(fe.metadata, additionalSensitiveFields) as Record<string, unknown>)
      : undefined,
  }))

  return {
    ...error,
    message: sanitizeString(error.message),
    fieldErrors: sanitizedFieldErrors,
    raw: includeRawError ? error.raw : undefined,
  }
}

export function sanitizeMetric(
  metric: ObservabilityMetric,
  config: SanitizationConfig = {},
): ObservabilityMetric {
  const { enabled = true, customMetricSanitizer, additionalSensitiveFields = [] } = config

  if (customMetricSanitizer) {
    return customMetricSanitizer(metric)
  }

  if (!enabled) {
    return metric
  }

  return {
    ...metric,
    tags: metric.tags
      ? (sanitizeObject(metric.tags, additionalSensitiveFields) as Record<string, string>)
      : undefined,
  }
}
