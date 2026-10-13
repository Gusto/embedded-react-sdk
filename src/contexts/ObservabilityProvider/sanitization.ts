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

/**
 * Replaces PII patterns (SSN, email, phone, credit card, long tokens) in a string with redacted placeholders.
 *
 * @param value - The string to scan and redact.
 * @returns The input with each matched pattern replaced by a `[TYPE-REDACTED]` placeholder.
 * @internal
 */
export function sanitizeString(value: string): string {
  let sanitized = value

  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement)
  }

  return sanitized
}

/**
 * Recursively walks a value, redacting sensitive object keys and PII patterns in nested strings.
 *
 * @remarks
 * Keys whose names match (case-insensitively contain) any built-in sensitive field name or any
 * entry in `additionalSensitiveFields` have their values replaced with `[REDACTED]`. String
 * values are passed through {@link sanitizeString} so PII patterns inside them are also redacted.
 * Numbers, booleans, `null`, and `undefined` pass through unchanged.
 *
 * @param obj - The value to sanitize. May be any JSON-shaped structure.
 * @param additionalSensitiveFields - Extra field names to treat as sensitive (case-insensitive substring match).
 * @returns A new value of the same shape with sensitive fields and PII patterns redacted.
 * @internal
 */
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

function applyErrorPolicy(
  error: ObservabilityError,
  { enabled = true, includeRawError = false, additionalSensitiveFields = [] }: SanitizationConfig,
): ObservabilityError {
  const raw = includeRawError ? error.raw : undefined

  if (!enabled) {
    return { ...error, raw }
  }

  return {
    ...error,
    message: sanitizeString(error.message),
    fieldErrors: error.fieldErrors.map(fe => ({
      ...fe,
      message: sanitizeString(fe.message),
      metadata: fe.metadata
        ? (sanitizeObject(fe.metadata, additionalSensitiveFields) as Record<string, unknown>)
        : undefined,
    })),
    raw,
  }
}

function applyMetricPolicy(
  metric: ObservabilityMetric,
  { enabled = true, additionalSensitiveFields = [] }: SanitizationConfig,
): ObservabilityMetric {
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

/**
 * Returns a copy of an observability error with PII redacted from messages and field-error metadata.
 *
 * @remarks
 * The SDK policy is applied around `config.customErrorSanitizer`, never in place of it. The policy
 * redacts `message` and each `fieldErrors[].message` with {@link sanitizeString}, redacts each
 * `fieldErrors[].metadata` with {@link sanitizeObject} (honoring `additionalSensitiveFields`), and
 * removes `raw` unless `includeRawError` is true. When `enabled` is false the redaction is skipped,
 * but `raw` is still removed unless `includeRawError` is true.
 *
 * With a custom sanitizer the order is: policy on the input, custom sanitizer, policy on the output.
 * The custom sanitizer therefore never receives data the SDK would redact, or `raw` (unless `includeRawError`
 * is true), and cannot reintroduce either.
 *
 * @param error - The error reported by SDK error boundaries or form submissions.
 * @param config - Optional sanitization configuration; defaults to enabled with `raw` stripped.
 * @returns The sanitized error suitable for forwarding to a partner observability hook.
 * @internal
 */
export function sanitizeError(
  error: ObservabilityError,
  config: SanitizationConfig = {},
): ObservabilityError {
  const policyApplied = applyErrorPolicy(error, config)

  if (!config.customErrorSanitizer) {
    return policyApplied
  }

  return applyErrorPolicy(config.customErrorSanitizer(policyApplied), config)
}

/**
 * Returns a copy of an observability metric with sensitive values redacted from its tags.
 *
 * @remarks
 * The SDK policy is applied around `config.customMetricSanitizer`, never in place of it. The `tags`
 * record is run through {@link sanitizeObject} with `additionalSensitiveFields` applied, unless
 * `enabled` is false. With a custom sanitizer the order is: policy on the input, custom sanitizer,
 * policy on the output.
 *
 * @param metric - The metric reported by SDK component instrumentation.
 * @param config - Optional sanitization configuration; defaults to enabled.
 * @returns The sanitized metric suitable for forwarding to a partner observability hook.
 * @internal
 */
export function sanitizeMetric(
  metric: ObservabilityMetric,
  config: SanitizationConfig = {},
): ObservabilityMetric {
  const policyApplied = applyMetricPolicy(metric, config)

  if (!config.customMetricSanitizer) {
    return policyApplied
  }

  return applyMetricPolicy(config.customMetricSanitizer(policyApplied), config)
}
