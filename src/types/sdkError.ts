import type { EntityErrorObject } from '@gusto/embedded-api-v-2026-06-15/models/components/entityerrorobject'
import { GustoEmbeddedError } from '@gusto/embedded-api-v-2026-06-15/models/errors/gustoembeddederror'
import { HTTPClientError } from '@gusto/embedded-api-v-2026-06-15/models/errors/httpclienterrors'
import { SDKValidationError } from '@gusto/embedded-api-v-2026-06-15/models/errors/sdkvalidationerror'
import { getFieldErrors } from '@/helpers/apiErrorToList'

/**
 * Constant map of {@link SDKErrorCategory} string values keyed by uppercase name.
 *
 * @remarks
 * Use this when you need to reference a category value by name (e.g.
 * `SDKErrorCategories.API_ERROR`). Each entry corresponds to one classification:
 *
 * | Value | When it applies |
 * | ----- | --------------- |
 * | `api_error` | HTTP error response from the Gusto API (422, 404, 409, 500, etc.) |
 * | `validation_error` | Client-side Zod schema validation before the request was sent |
 * | `network_error` | Network connectivity failure (connection refused, timeout, abort) |
 * | `internal_error` | Unexpected runtime error (unhandled exception, initialization failure) |
 *
 * @public
 */
export const SDKErrorCategories = {
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  INTERNAL_ERROR: 'internal_error',
} as const

/**
 * High-level classification of where an {@link SDKError} originated.
 *
 * @public
 */
export type SDKErrorCategory = (typeof SDKErrorCategories)[keyof typeof SDKErrorCategories]

/**
 * An error thrown by internal SDK logic that should be caught and normalized
 * by `baseSubmitHandler` rather than propagating to the ErrorBoundary.
 *
 * Use this for guard clauses and data integrity checks inside submit handler
 * callbacks where the error should surface as an inline banner, not a crash.
 *
 * @internal
 *
 * @example
 * ```typescript
 * await baseSubmitHandler(data, async () => {
 *   const response = await createPayroll({ ... })
 *   if (!response.payrollId) {
 *     throw new SDKInternalError('Missing payroll ID in response')
 *   }
 * })
 * ```
 */
export class SDKInternalError extends Error {
  readonly category: SDKErrorCategory

  constructor(message: string, category: SDKErrorCategory = 'internal_error') {
    super(message)
    this.name = 'SDKInternalError'
    this.category = category
  }
}

/**
 * A flattened, field-level error extracted from an API response.
 *
 * @remarks
 * For API errors with structured field errors (e.g. 422 responses), nested
 * `errors[]` structures are recursively flattened into one entry per leaf
 * field. The `field` property is the dot-separated camelCase path
 * (e.g. `"firstName"`, `"states.CA.filingStatus.value"`).
 *
 * @public
 */
export interface SDKFieldError {
  /** Dot-separated camelCase field path (e.g. "firstName", "states.CA.filingStatus.value") */
  field: string
  /** API error category (e.g. "invalid_attribute_value", "invalid_operation", "payroll_blocker") */
  category: string
  /** Human-readable error message from the API */
  message: string
  /** Additional metadata from the API (e.g. `{ key: "missing_bank_info" }` for payroll blockers) */
  metadata?: Record<string, unknown>
}

/**
 * Unified error shape returned by every form hook and error-handling surface.
 *
 * @remarks
 * Every caught error — whether from the Gusto API, client-side Zod validation,
 * a network failure, or an unexpected runtime exception — is normalized into
 * this shape. The {@link SDKErrorCategory} `category` field distinguishes
 * which source produced the error; `fieldErrors` is populated for structured
 * API responses (typically 422) and is an empty array otherwise.
 *
 * Observability telemetry uses {@link ObservabilityError}, which extends this
 * shape with component context.
 *
 * @public
 *
 * @example
 * ```tsx
 * import { useEmployeeForm } from '@gusto/embedded-react-sdk'
 *
 * const { errorHandling } = useEmployeeForm({ employeeId })
 * const error = errorHandling.error
 *
 * if (error) {
 *   console.log(error.category)    // 'api_error'
 *   console.log(error.httpStatus)  // 422
 *   console.log(error.fieldErrors) // [{ field: 'firstName', ... }]
 * }
 * ```
 */
export interface SDKError {
  /** High-level error classification */
  category: SDKErrorCategory

  /** Human-readable error summary */
  message: string

  /** HTTP status code (undefined for non-HTTP errors like network or validation) */
  httpStatus?: number

  /** Flattened field-level errors from API responses. Empty array for non-field errors. */
  fieldErrors: SDKFieldError[]

  /**
   * The original error object for advanced use cases.
   * May be stripped by sanitization (controlled by `sanitization.includeRawError`).
   */
  raw?: unknown
}

interface ErrorWithErrors {
  errors: EntityErrorObject[]
}

function hasErrorsArray(error: unknown): error is ErrorWithErrors {
  return (
    error !== null &&
    typeof error === 'object' &&
    'errors' in error &&
    Array.isArray((error as { errors: unknown }).errors)
  )
}

function humanizeFieldName(snakeCaseField: string): string {
  if (!snakeCaseField) return snakeCaseField
  const words = snakeCaseField.replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function humanizeMessage(message: string, field: string): string {
  if (!message || !field) return message
  const humanized = humanizeFieldName(field)
  return message.replace(field, humanized)
}

function toSDKFieldError(entityError: EntityErrorObject): SDKFieldError {
  const rawMessage = entityError.message ?? ''
  return {
    field: entityError.errorKey,
    message: humanizeMessage(rawMessage, entityError.errorKey),
    category: entityError.category,
    metadata: entityError.metadata as Record<string, unknown> | undefined,
  }
}

/**
 * Extracts and flattens field errors from an API error's `errors[]` array.
 *
 * Uses the existing `getFieldErrors` recursive traversal for nested errors,
 * with a fallback for errors in categories that `getFieldErrors` doesn't handle.
 */
function extractFieldErrors(errors: EntityErrorObject[]): SDKFieldError[] {
  const flattened = errors.flatMap(err => getFieldErrors(err))
  if (flattened.length > 0) {
    return flattened.map(toSDKFieldError)
  }

  return errors.filter(err => err.message).map(toSDKFieldError)
}

interface RawAPIFieldError {
  error_key?: string
  errorKey?: string
  category: string
  message?: string
  metadata?: Record<string, unknown>
}

function rawToEntityError(raw: RawAPIFieldError): EntityErrorObject {
  return {
    errorKey: raw.errorKey ?? raw.error_key ?? '',
    category: raw.category,
    message: raw.message,
    metadata: raw.metadata,
  }
}

function tryExtractFieldErrorsFromBody(body: string | undefined): SDKFieldError[] {
  if (!body) return []
  try {
    const parsed: unknown = JSON.parse(body)
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'errors' in parsed &&
      Array.isArray((parsed as { errors: unknown }).errors)
    ) {
      const errors = (parsed as { errors: RawAPIFieldError[] }).errors
      return errors
        .filter(err => err.message)
        .map(rawToEntityError)
        .map(toSDKFieldError)
    }
  } catch {
    // Body isn't valid JSON
  }
  return []
}

function buildApiErrorMessage(fieldErrors: SDKFieldError[], fallbackMessage: string): string {
  if (fieldErrors.length === 0) {
    return fallbackMessage
  }
  return fieldErrors.length === 1
    ? '1 field has issues'
    : `${fieldErrors.length} fields have issues`
}

/**
 * Normalizes any caught error into a unified `SDKError`.
 *
 * Classification is based purely on the error type:
 * - `SDKInternalError` → uses the error's own `category` (default: `internal_error`)
 * - `GustoEmbeddedError` subclasses → `api_error`
 * - `SDKValidationError` → `validation_error`
 * - `HTTPClientError` subclasses → `network_error`
 * - Everything else → `internal_error`
 *
 * @internal
 */
export function normalizeToSDKError(error: unknown): SDKError {
  if (error instanceof SDKInternalError) {
    return {
      category: error.category,
      message: error.message,
      fieldErrors: [],
      raw: error,
    }
  }

  if (error instanceof SDKValidationError) {
    return {
      category: 'validation_error',
      message: typeof error.rawMessage === 'string' ? error.rawMessage : error.message,
      fieldErrors: [],
      raw: error,
    }
  }

  if (error instanceof HTTPClientError) {
    return {
      category: 'network_error',
      message: error.message,
      fieldErrors: [],
      raw: error,
    }
  }

  if (error instanceof GustoEmbeddedError) {
    const httpStatus = error.httpMeta.response.status
    const fieldErrors = hasErrorsArray(error)
      ? extractFieldErrors(error.errors)
      : tryExtractFieldErrorsFromBody(error.httpMeta.body)

    return {
      category: 'api_error',
      message: buildApiErrorMessage(fieldErrors, error.message),
      httpStatus,
      fieldErrors,
      raw: error,
    }
  }

  if (error instanceof Error) {
    return {
      category: 'internal_error',
      message: error.message,
      fieldErrors: [],
      raw: error,
    }
  }

  return {
    category: 'internal_error',
    message: 'An unknown error occurred',
    fieldErrors: [],
    raw: error,
  }
}
