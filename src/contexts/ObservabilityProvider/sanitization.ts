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
  'dateOfBirth',
  'date_of_birth',
  'birthDate',
  'birth_date',
  'birthday',
  'firstName',
  'first_name',
  'lastName',
  'last_name',
  'middleName',
  'middle_name',
  'fullName',
  'full_name',
  'employeeName',
  'employee_name',
  'signatureText',
  'signature_text',
  'retirementLoanIdentifier',
  'retirement_loan_identifier',
  'phone',
  'zipCode',
  'zip_code',
  'postalCode',
  'postal_code',
  'preparerCity',
  'preparer_city',
  'preparerZip',
  'preparer_zip',
  'preparer2City',
  'preparer2_city',
  'preparer2Zip',
  'preparer2_zip',
  'preparer3City',
  'preparer3_city',
  'preparer3Zip',
  'preparer3_zip',
  'preparer4City',
  'preparer4_city',
  'preparer4Zip',
  'preparer4_zip',
  'address',
  'street1',
  'street_1',
  'street2',
  'street_2',
  'caseNumber',
  'case_number',
  'orderNumber',
  'order_number',
  'remittanceNumber',
  'remittance_number',
  'documentNumber',
  'document_number',
]

const EXACT_SENSITIVE_FIELD_NAMES = new Set(['ein', 'dob', 'zip', 'city'])

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
 * entry in `additionalSensitiveFields` have their values replaced with `[REDACTED]`. Short names
 * (`ein`, `dob`, `zip`, `city`) match the whole key, case-insensitively. String
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
      const lowerKey = key.toLowerCase()
      if (
        EXACT_SENSITIVE_FIELD_NAMES.has(lowerKey) ||
        allSensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))
      ) {
        sanitized[key] = '[REDACTED]'
        continue
      }

      sanitized[key] = sanitizeObject(value, additionalSensitiveFields)
    }

    return sanitized
  }

  return obj
}

function redactError(
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
    fieldErrors: error.fieldErrors.map(fieldError => ({
      ...fieldError,
      message: sanitizeString(fieldError.message),
      metadata: fieldError.metadata
        ? (sanitizeObject(fieldError.metadata, additionalSensitiveFields) as Record<
            string,
            unknown
          >)
        : undefined,
    })),
    raw,
  }
}

function redactMetric(
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
 * Redacts error messages and field-error metadata before and after a custom sanitizer runs.
 *
 * @remarks
 * `enabled: false` skips redaction. Independently, `raw` is excluded before and after the
 * custom sanitizer unless `includeRawError: true`. Opted-in `raw` is passed through unchanged.
 * Other error properties are preserved without redaction.
 *
 * @internal
 */
export function sanitizeError(
  error: ObservabilityError,
  config: SanitizationConfig = {},
): ObservabilityError {
  const sanitized = redactError(error, config)
  return config.customErrorSanitizer
    ? redactError(config.customErrorSanitizer(sanitized), config)
    : sanitized
}

/**
 * Redacts metric tags before and after a custom sanitizer runs, unless `enabled: false`.
 *
 * @remarks
 * Other metric properties are preserved without redaction.
 *
 * @internal
 */
export function sanitizeMetric(
  metric: ObservabilityMetric,
  config: SanitizationConfig = {},
): ObservabilityMetric {
  const sanitized = redactMetric(metric, config)
  return config.customMetricSanitizer
    ? redactMetric(config.customMetricSanitizer(sanitized), config)
    : sanitized
}
