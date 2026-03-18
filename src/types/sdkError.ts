import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { HTTPClientError } from '@gusto/embedded-api/models/errors/httpclienterrors'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { getFieldErrors } from '@/helpers/apiErrorToList'

/**
 * High-level classification of where/how the error originated.
 *
 * - `api_error` — HTTP error response from the Gusto API (422, 404, 409, 500, etc.)
 * - `validation_error` — Client-side Zod schema validation before the request was sent
 * - `network_error` — Network connectivity failure (connection refused, timeout, abort)
 * - `internal_error` — Unexpected runtime error (unhandled exception, initialization failure)
 */
export type SDKErrorCategory = 'api_error' | 'validation_error' | 'network_error' | 'internal_error'

/**
 * A flattened, field-level error extracted from an API response.
 *
 * For API errors with `errors[]`, nested structures are recursively flattened
 * into leaf entries. The `field` property is the dot-separated camelCase path
 * (e.g. `"states.CA.filingStatus.value"`).
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
 * The unified SDK error type for all error scenarios.
 *
 * This is the core error shape exposed through partner-facing hooks. For
 * observability telemetry (which includes component context), see
 * `ObservabilityError` in `@/types/observability`.
 *
 * @example
 * ```tsx
 * const { error } = useEmployeeForm({ employeeId })
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
    Array.isArray((error as ErrorWithErrors).errors)
  )
}

function toSDKFieldError(entityError: EntityErrorObject): SDKFieldError {
  return {
    field: entityError.errorKey,
    message: entityError.message ?? '',
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

function buildApiErrorMessage(fieldErrors: SDKFieldError[], fallbackMessage: string): string {
  if (fieldErrors.length === 1) {
    const first = fieldErrors[0]
    if (first && first.message) {
      return first.message
    }
  }
  if (fieldErrors.length > 1) {
    const firstWithMessage = fieldErrors.find(e => e.message)
    if (firstWithMessage) {
      return firstWithMessage.message
    }
  }
  return fallbackMessage
}

/**
 * Normalizes any caught error into a unified `SDKError`.
 *
 * Classification is based purely on the error type:
 * - `GustoEmbeddedError` subclasses → `api_error`
 * - `SDKValidationError` → `validation_error`
 * - `HTTPClientError` subclasses → `network_error`
 * - Everything else → `internal_error`
 */
export function normalizeToSDKError(error: unknown): SDKError {
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
    const fieldErrors = hasErrorsArray(error) ? extractFieldErrors(error.errors) : []

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
