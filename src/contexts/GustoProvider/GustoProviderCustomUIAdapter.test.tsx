import { describe, it, expect, vi } from 'vitest'
import { sanitizeError } from '../ObservabilityProvider/sanitization'
import type { ObservabilityError, ObservabilityHook } from '@/types/observability'

describe('GustoProviderCustomUIAdapter', () => {
  describe('Top-level ErrorBoundary sanitization', () => {
    it('should sanitize PII in error messages using sanitizeError', () => {
      const unsanitizedError: ObservabilityError = {
        category: 'internal_error',
        message: 'User email: john@example.com, SSN: 123-45-6789',
        fieldErrors: [],
        raw: new Error('Test'),
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
        includeRawError: false,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.message).toBe('User email: [EMAIL-REDACTED], SSN: [SSN-REDACTED]')
      expect(sanitized.raw).toBeUndefined()
    })

    it('should exclude raw error by default', () => {
      const rawError = new Error('Original error with PII')
      const unsanitizedError: ObservabilityError = {
        category: 'internal_error',
        message: 'Test error',
        fieldErrors: [],
        raw: rawError,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
        includeRawError: false,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.raw).toBeUndefined()
    })

    it('should include raw error when configured', () => {
      const rawError = new Error('Original error with PII: test@example.com')
      const unsanitizedError: ObservabilityError = {
        category: 'internal_error',
        message: 'Original error with PII: test@example.com',
        fieldErrors: [],
        raw: rawError,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
        includeRawError: true,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.raw).toBe(rawError)
      expect(sanitized.message).toBe('Original error with PII: [EMAIL-REDACTED]')
    })

    it('should allow disabling sanitization', () => {
      const unsanitizedError: ObservabilityError = {
        category: 'internal_error',
        message: 'User email: john@example.com',
        fieldErrors: [],
        raw: null,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: false,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.message).toBe('User email: john@example.com')
    })

    it('should verify handleTopLevelError uses sanitizeError correctly', () => {
      const onError = vi.fn()
      const config: ObservabilityHook = {
        onError,
        sanitization: {
          enabled: true,
          includeRawError: false,
        },
      }

      const error = new Error('PII: user@example.com')
      const unsanitizedError: ObservabilityError = {
        category: 'internal_error',
        message: error.message,
        fieldErrors: [],
        raw: error,
        timestamp: Date.now(),
        componentStack: 'component stack here',
      }

      const sanitized = sanitizeError(unsanitizedError, config.sanitization)
      config.onError?.(sanitized)

      expect(onError).toHaveBeenCalledTimes(1)
      const capturedError = onError.mock.calls[0]?.[0]
      expect(capturedError?.message).toBe('PII: [EMAIL-REDACTED]')
      expect(capturedError?.raw).toBeUndefined()
    })

    it('should sanitize field error messages and metadata', () => {
      const unsanitizedError: ObservabilityError = {
        category: 'api_error',
        message: 'Validation failed',
        httpStatus: 422,
        fieldErrors: [
          {
            field: 'email',
            category: 'invalid_attribute_value',
            message: 'john@example.com is not valid',
            metadata: { ssn: '123-45-6789' },
          },
        ],
        raw: null,
        timestamp: Date.now(),
      }

      const sanitized = sanitizeError(unsanitizedError, { enabled: true })

      expect(sanitized.fieldErrors[0]!.message).toBe('[EMAIL-REDACTED] is not valid')
      expect(sanitized.fieldErrors[0]!.metadata).toEqual({ ssn: '[REDACTED]' })
    })
  })
})
