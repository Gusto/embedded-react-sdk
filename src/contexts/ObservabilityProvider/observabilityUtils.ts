import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import type { ObservabilityError, ObservabilityErrorType } from '@/types/observability'

/**
 * Converts SDK errors into structured ObservabilityError objects
 */
export function createObservabilityError(
  error: unknown,
  type?: ObservabilityErrorType,
): ObservabilityError | null {
  const timestamp = Date.now()
  const message = error instanceof Error ? error.message : 'Unknown error'
  const stack = error instanceof Error ? error.stack : undefined

  // Auto-detect error type based on instance if not provided
  if (error instanceof SDKValidationError) {
    return {
      type: type || 'validation_error',
      message,
      stack,
      context: {
        validationSchema: error.pretty(),
      },
      originalError: error,
      timestamp,
    }
  }

  if (error instanceof APIError) {
    return {
      type: type || 'api_error',
      message,
      stack,
      context: {
        statusCode: error.httpMeta.response.status,
      },
      originalError: error,
      timestamp,
    }
  }

  if (error instanceof GustoEmbeddedError) {
    return {
      type: type || 'api_error',
      message,
      stack,
      context: {
        statusCode: error.httpMeta.response.status,
      },
      originalError: error,
      timestamp,
    }
  }

  // For unknown errors, only create ObservabilityError if type is explicitly provided
  if (type) {
    return {
      type,
      message,
      stack,
      context: {},
      originalError: error,
      timestamp,
    }
  }

  return null
}
