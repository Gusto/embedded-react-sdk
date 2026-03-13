import { describe, it, expect } from 'vitest'
import { sanitizeString, sanitizeObject, sanitizeError, sanitizeMetric } from './sanitization'
import type { ObservabilityError, ObservabilityMetric } from '@/types/observability'

describe('sanitizeString', () => {
  it('should redact SSN patterns', () => {
    expect(sanitizeString('SSN: 123-45-6789')).toBe('SSN: [SSN-REDACTED]')
    expect(sanitizeString('SSN: 123456789')).toBe('SSN: [SSN-REDACTED]')
  })

  it('should redact email addresses', () => {
    expect(sanitizeString('Contact: john@example.com')).toBe('Contact: [EMAIL-REDACTED]')
    expect(sanitizeString('Email: user+tag@domain.co.uk')).toBe('Email: [EMAIL-REDACTED]')
  })

  it('should redact phone numbers', () => {
    expect(sanitizeString('Call: 123-456-7890')).toBe('Call: [PHONE-REDACTED]')
    expect(sanitizeString('Phone: (555) 123-4567')).toBe('Phone: [PHONE-REDACTED]')
    expect(sanitizeString('Mobile: 5551234567')).toBe('Mobile: [PHONE-REDACTED]')
  })

  it('should redact credit card numbers', () => {
    expect(sanitizeString('Card: 1234-5678-9012-3456')).toBe('Card: [CC-REDACTED]')
    expect(sanitizeString('CC: 1234 5678 9012 3456')).toBe('CC: [CC-REDACTED]')
  })

  it('should handle multiple patterns in one string', () => {
    const input = 'User john@example.com has SSN 123-45-6789 and phone 555-123-4567'
    const expected = 'User [EMAIL-REDACTED] has SSN [SSN-REDACTED] and phone [PHONE-REDACTED]'
    expect(sanitizeString(input)).toBe(expected)
  })

  it('should not modify strings without PII', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World')
    expect(sanitizeString('Error: Invalid input')).toBe('Error: Invalid input')
  })
})

describe('sanitizeObject', () => {
  it('should remove sensitive fields', () => {
    const obj = {
      name: 'John Doe',
      password: 'secret123',
      email: 'john@example.com',
      apiKey: 'abc123xyz',
    }
    
    const result = sanitizeObject(obj)
    
    expect(result).toEqual({
      name: 'John Doe',
      password: '[REDACTED]',
      email: '[EMAIL-REDACTED]',
      apiKey: '[REDACTED]',
    })
  })

  it('should handle nested objects', () => {
    const obj = {
      user: {
        name: 'Jane',
        ssn: '123-45-6789',
        contact: {
          email: 'jane@example.com',
          phone: '555-123-4567',
        },
      },
    }
    
    const result = sanitizeObject(obj)
    
    expect(result).toEqual({
      user: {
        name: 'Jane',
        ssn: '[REDACTED]',
        contact: {
          email: '[EMAIL-REDACTED]',
          phone: '[PHONE-REDACTED]',
        },
      },
    })
  })

  it('should handle arrays', () => {
    const obj = {
      users: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' },
      ],
    }
    
    const result = sanitizeObject(obj)
    
    expect(result).toEqual({
      users: [
        { name: 'Alice', email: '[EMAIL-REDACTED]' },
        { name: 'Bob', email: '[EMAIL-REDACTED]' },
      ],
    })
  })

  it('should preserve non-sensitive data types', () => {
    const obj = {
      count: 42,
      enabled: true,
      items: ['apple', 'banana'],
      metadata: null,
      timestamp: undefined,
    }
    
    const result = sanitizeObject(obj)
    
    expect(result).toEqual({
      count: 42,
      enabled: true,
      items: ['apple', 'banana'],
      metadata: null,
      timestamp: undefined,
    })
  })

  it('should be case-insensitive for sensitive field names', () => {
    const obj = {
      PASSWORD: 'secret',
      ApiKey: 'key123',
      SOCIAL_SECURITY_NUMBER: '123-45-6789',
    }
    
    const result = sanitizeObject(obj)
    
    expect(result).toEqual({
      PASSWORD: '[REDACTED]',
      ApiKey: '[REDACTED]',
      SOCIAL_SECURITY_NUMBER: '[REDACTED]',
    })
  })
})

describe('sanitizeError', () => {
  const mockError: ObservabilityError = {
    type: 'validation_error',
    message: 'Validation failed for email: john@example.com',
    stack: 'Error: Validation failed\n  at validate (user.ts:123)',
    context: {
      componentName: 'UserForm',
      metadata: {
        email: 'john@example.com',
        password: 'secret123',
      },
    },
    originalError: new Error('Original'),
    timestamp: Date.now(),
  }

  it('should sanitize error message and context by default', () => {
    const result = sanitizeError(mockError)
    
    expect(result.message).toBe('Validation failed for email: [EMAIL-REDACTED]')
    expect(result.context.metadata).toEqual({
      email: '[EMAIL-REDACTED]',
      password: '[REDACTED]',
    })
    expect(result.originalError).toBeUndefined()
  })

  it('should include original error when configured', () => {
    const result = sanitizeError(mockError, { includeOriginalError: true })
    
    expect(result.originalError).toBeDefined()
  })

  it('should not sanitize when disabled', () => {
    const result = sanitizeError(mockError, { enabled: false })
    
    expect(result.message).toBe(mockError.message)
    expect(result.originalError).toBeUndefined()
  })

  it('should use custom sanitizer when provided', () => {
    const customSanitizer = (error: ObservabilityError) => ({
      ...error,
      message: 'CUSTOM',
    })
    
    const result = sanitizeError(mockError, { customErrorSanitizer: customSanitizer })
    
    expect(result.message).toBe('CUSTOM')
  })

  it('should add additional sensitive fields', () => {
    const errorWithCustomFields: ObservabilityError = {
      ...mockError,
      context: {
        metadata: {
          customerId: '12345',
          internalId: 'abc-xyz',
        },
      },
    }
    
    const result = sanitizeError(errorWithCustomFields, {
      additionalSensitiveFields: ['customerId', 'internalId'],
    })
    
    expect(result.context.metadata).toEqual({
      customerId: '[REDACTED]',
      internalId: '[REDACTED]',
    })
  })

  it('should not mutate global SENSITIVE_FIELD_NAMES array', () => {
    // Call sanitizeError with additional fields
    sanitizeError(mockError, {
      additionalSensitiveFields: ['customField1', 'customField2'],
    })
    
    // Call again with different fields
    sanitizeError(mockError, {
      additionalSensitiveFields: ['customField3', 'customField4'],
    })
    
    // Verify the global array wasn't mutated by checking a new error without custom fields
    const errorWithPassword: ObservabilityError = {
      ...mockError,
      context: {
        metadata: {
          password: 'secret',
          customField1: 'should not be redacted',
        },
      },
    }
    
    const result = sanitizeError(errorWithPassword, {})
    
    // password should be redacted (it's in default list)
    expect(result.context.metadata).toHaveProperty('password', '[REDACTED]')
    // customField1 should NOT be redacted (not in default list)
    expect(result.context.metadata).toHaveProperty('customField1', 'should not be redacted')
  })

  it('should apply additionalSensitiveFields consistently across multiple calls', () => {
    const error1: ObservabilityError = {
      ...mockError,
      context: {
        metadata: { myCustomField: 'value1' },
      },
    }
    
    const error2: ObservabilityError = {
      ...mockError,
      context: {
        metadata: { myCustomField: 'value2' },
      },
    }
    
    // First call with custom field
    const result1 = sanitizeError(error1, {
      additionalSensitiveFields: ['myCustomField'],
    })
    
    // Second call without custom field
    const result2 = sanitizeError(error2, {})
    
    // First should be redacted
    expect(result1.context.metadata).toHaveProperty('myCustomField', '[REDACTED]')
    // Second should NOT be redacted (config doesn't include it)
    expect(result2.context.metadata).toHaveProperty('myCustomField', 'value2')
  })
})

describe('sanitizeMetric', () => {
  const mockMetric: ObservabilityMetric = {
    name: 'sdk.form.submit_duration',
    value: 1234,
    unit: 'ms',
    tags: {
      component: 'UserForm',
      email: 'user@example.com',
      password: 'secret123',
    },
    timestamp: Date.now(),
  }

  it('should sanitize metric tags by default', () => {
    const result = sanitizeMetric(mockMetric)
    
    expect(result.tags).toEqual({
      component: 'UserForm',
      email: '[EMAIL-REDACTED]',
      password: '[REDACTED]',
    })
  })

  it('should not sanitize when disabled', () => {
    const result = sanitizeMetric(mockMetric, { enabled: false })
    
    expect(result.tags).toEqual(mockMetric.tags)
  })

  it('should use custom sanitizer when provided', () => {
    const customSanitizer = (metric: ObservabilityMetric) => ({
      ...metric,
      tags: { custom: 'tags' },
    })
    
    const result = sanitizeMetric(mockMetric, { customMetricSanitizer: customSanitizer })
    
    expect(result.tags).toEqual({ custom: 'tags' })
  })

  it('should handle metrics without tags', () => {
    const metricWithoutTags: ObservabilityMetric = {
      name: 'sdk.component.loading_duration',
      value: 500,
      unit: 'ms',
      timestamp: Date.now(),
    }
    
    const result = sanitizeMetric(metricWithoutTags)
    
    expect(result).toEqual(metricWithoutTags)
  })

  it('should apply additionalSensitiveFields to metrics', () => {
    const metricWithCustomFields: ObservabilityMetric = {
      name: 'sdk.custom.metric',
      value: 100,
      unit: 'count',
      tags: {
        component: 'MyComponent',
        customerId: '12345',
        internalId: 'abc-xyz',
      },
      timestamp: Date.now(),
    }
    
    const result = sanitizeMetric(metricWithCustomFields, {
      additionalSensitiveFields: ['customerId', 'internalId'],
    })
    
    expect(result.tags).toEqual({
      component: 'MyComponent',
      customerId: '[REDACTED]',
      internalId: '[REDACTED]',
    })
  })

  it('should not leak additionalSensitiveFields between error and metric calls', () => {
    // First sanitize an error with custom fields
    const error: ObservabilityError = {
      type: 'api_error',
      message: 'Error',
      context: {
        metadata: { myField: 'value1' },
      },
      originalError: null,
      timestamp: Date.now(),
    }
    
    sanitizeError(error, {
      additionalSensitiveFields: ['myField'],
    })
    
    // Then sanitize a metric without specifying custom fields
    const metric: ObservabilityMetric = {
      name: 'test.metric',
      value: 1,
      tags: { myField: 'value2' },
      timestamp: Date.now(),
    }
    
    const result = sanitizeMetric(metric, {})
    
    // myField should NOT be redacted in metric (wasn't in metric config)
    expect(result.tags).toHaveProperty('myField', 'value2')
  })
})
