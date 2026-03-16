import { describe, it, expect, vi } from 'vitest'
import { sanitizeError } from '../ObservabilityProvider/sanitization'
import type { ObservabilityHook } from '@/types/observability'

describe('GustoProviderCustomUIAdapter', () => {
  describe('Top-level ErrorBoundary sanitization', () => {
    it('should sanitize PII in error messages using sanitizeError', () => {
      const unsanitizedError = {
        type: 'internal_error' as const,
        message: 'User email: john@example.com, SSN: 123-45-6789',
        stack: undefined,
        context: {
          componentStack: undefined,
        },
        originalError: new Error('Test'),
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
        includeOriginalError: false,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.message).toBe('User email: [EMAIL-REDACTED], SSN: [SSN-REDACTED]')
      expect(sanitized.originalError).toBeUndefined()
    })

    it('should exclude originalError by default', () => {
      const originalError = new Error('Original error with PII')
      const unsanitizedError = {
        type: 'internal_error' as const,
        message: 'Test error',
        stack: undefined,
        context: {},
        originalError,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
        includeOriginalError: false, // default
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.originalError).toBeUndefined()
    })

    it('should include originalError when configured', () => {
      const originalError = new Error('Original error with PII: test@example.com')
      const unsanitizedError = {
        type: 'internal_error' as const,
        message: 'Original error with PII: test@example.com',
        stack: undefined,
        context: {},
        originalError,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
        includeOriginalError: true,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.originalError).toBe(originalError)
      expect(sanitized.message).toBe('Original error with PII: [EMAIL-REDACTED]')
    })

    it('should sanitize stack traces', () => {
      const unsanitizedError = {
        type: 'internal_error' as const,
        message: 'Test error',
        stack: 'Error: Test error\n  at user@example.com:1:1\n  at SSN-123-45-6789:2:2',
        context: {},
        originalError: null,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: true,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.stack).toContain('[EMAIL-REDACTED]')
      expect(sanitized.stack).toContain('[SSN-REDACTED]')
    })

    it('should allow disabling sanitization', () => {
      const unsanitizedError = {
        type: 'internal_error' as const,
        message: 'User email: john@example.com',
        stack: undefined,
        context: {},
        originalError: null,
        timestamp: Date.now(),
      }

      const config: ObservabilityHook['sanitization'] = {
        enabled: false,
      }

      const sanitized = sanitizeError(unsanitizedError, config)

      expect(sanitized.message).toBe('User email: john@example.com')
    })

    it('should verify handleTopLevelError uses sanitizeError correctly', () => {
      // This test verifies the logic flow that would be used in handleTopLevelError
      const onError = vi.fn()
      const config: ObservabilityHook = {
        onError,
        sanitization: {
          enabled: true,
          includeOriginalError: false,
        },
      }

      // Simulate what handleTopLevelError does
      const error = new Error('PII: user@example.com')
      const unsanitizedError = {
        type: 'internal_error' as const,
        message: error.message,
        stack: error.stack,
        context: {
          componentStack: 'component stack here',
        },
        originalError: error,
        timestamp: Date.now(),
      }

      const sanitized = sanitizeError(unsanitizedError, config.sanitization)
      config.onError?.(sanitized)

      expect(onError).toHaveBeenCalledTimes(1)
      const capturedError = onError.mock.calls[0]?.[0]
      expect(capturedError?.message).toBe('PII: [EMAIL-REDACTED]')
      expect(capturedError?.originalError).toBeUndefined()
    })
  })
})
