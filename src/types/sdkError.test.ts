import { describe, expect, it } from 'vitest'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { HTTPClientError } from '@gusto/embedded-api/models/errors/httpclienterrors'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { normalizeToSDKError, SDKInternalError } from './sdkError'

function createHttpMeta(status: number, body: string) {
  return {
    response: new Response(body, { status }),
    request: new Request('https://api.gusto.com/v1/test'),
    body,
  }
}

describe('normalizeToSDKError', () => {
  describe('SDKInternalError', () => {
    it('uses the default internal_error category', () => {
      const error = new SDKInternalError('Missing payroll ID')
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('internal_error')
      expect(result.message).toBe('Missing payroll ID')
      expect(result.fieldErrors).toEqual([])
      expect(result.raw).toBe(error)
    })

    it('uses a custom category when provided', () => {
      const error = new SDKInternalError('Bad input', 'validation_error')
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('validation_error')
      expect(result.message).toBe('Bad input')
    })
  })

  describe('GustoEmbeddedError with parsed errors array (typed errors)', () => {
    it('extracts field errors from a typed error with errors[]', () => {
      const body = JSON.stringify({
        errors: [
          {
            error_key: 'first_name',
            category: 'invalid_attribute_value',
            message: 'First name is required',
          },
        ],
      })
      const httpMeta = createHttpMeta(422, body)
      const error = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'first_name',
              category: 'invalid_attribute_value',
              message: 'First name is required',
            },
          ],
        },
        httpMeta,
      )

      const result = normalizeToSDKError(error)

      expect(result.category).toBe('api_error')
      expect(result.httpStatus).toBe(422)
      expect(result.message).toBe('1 field has issues')
      expect(result.fieldErrors).toEqual([
        {
          field: 'firstName',
          category: 'invalid_attribute_value',
          message: 'First name is required',
          metadata: undefined,
        },
      ])
    })
  })

  describe('APIError (fallback class) — body parsing', () => {
    it('parses field errors from a JSON body with errors[]', () => {
      const body = JSON.stringify({
        errors: [
          {
            error_key: 'email',
            category: 'invalid_attribute_value',
            message: 'Email is already taken',
          },
        ],
      })
      const error = new APIError('', createHttpMeta(500, body))
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('api_error')
      expect(result.httpStatus).toBe(500)
      expect(result.fieldErrors).toHaveLength(1)
      expect(result.fieldErrors[0]).toMatchObject({
        field: 'email',
        category: 'invalid_attribute_value',
        message: 'Email is already taken',
      })
      expect(result.message).toBe('1 field has issues')
    })

    it('parses multiple field errors from body and uses count message', () => {
      const body = JSON.stringify({
        errors: [
          {
            error_key: 'first_name',
            category: 'invalid_attribute_value',
            message: 'First name is required',
          },
          {
            error_key: 'last_name',
            category: 'invalid_attribute_value',
            message: 'Last name is required',
          },
        ],
      })
      const error = new APIError('', createHttpMeta(422, body))
      const result = normalizeToSDKError(error)

      expect(result.fieldErrors).toHaveLength(2)
      expect(result.message).toBe('2 fields have issues')
    })

    it('falls back to the raw message when body is not valid JSON', () => {
      const error = new APIError('', createHttpMeta(500, 'Internal Server Error'))
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('api_error')
      expect(result.httpStatus).toBe(500)
      expect(result.fieldErrors).toEqual([])
      expect(result.message).toContain('Status 500')
    })

    it('falls back to the raw message when body JSON has no errors array', () => {
      const body = JSON.stringify({ message: 'Something went wrong' })
      const error = new APIError('', createHttpMeta(403, body))
      const result = normalizeToSDKError(error)

      expect(result.fieldErrors).toEqual([])
      expect(result.message).toContain('Status 403')
    })

    it('falls back to the raw message when body is empty', () => {
      const error = new APIError('', createHttpMeta(502, ''))
      const result = normalizeToSDKError(error)

      expect(result.fieldErrors).toEqual([])
      expect(result.message).toContain('Status 502')
    })

    it('skips errors entries that lack a message', () => {
      const body = JSON.stringify({
        errors: [
          { error_key: 'ssn', category: 'invalid_attribute_value' },
          {
            error_key: 'email',
            category: 'invalid_attribute_value',
            message: 'Email is invalid',
          },
        ],
      })
      const error = new APIError('', createHttpMeta(500, body))
      const result = normalizeToSDKError(error)

      expect(result.fieldErrors).toHaveLength(1)
      expect(result.fieldErrors[0]?.field).toBe('email')
      expect(result.message).toBe('1 field has issues')
    })
  })

  describe('SDKValidationError', () => {
    it('normalizes to validation_error category', () => {
      const error = new SDKValidationError('Raw message', { field: 'bad' }, 'rawValue')
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('validation_error')
      expect(result.message).toBe('Raw message')
      expect(result.fieldErrors).toEqual([])
    })
  })

  describe('HTTPClientError', () => {
    it('normalizes to network_error category', () => {
      const error = new HTTPClientError('Connection refused')
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('network_error')
      expect(result.message).toBe('Connection refused')
      expect(result.fieldErrors).toEqual([])
    })
  })

  describe('generic Error', () => {
    it('normalizes to internal_error category', () => {
      const error = new Error('Something broke')
      const result = normalizeToSDKError(error)

      expect(result.category).toBe('internal_error')
      expect(result.message).toBe('Something broke')
      expect(result.fieldErrors).toEqual([])
      expect(result.raw).toBe(error)
    })
  })

  describe('unknown thrown value', () => {
    it('normalizes a string to internal_error with default message', () => {
      const result = normalizeToSDKError('oops')

      expect(result.category).toBe('internal_error')
      expect(result.message).toBe('An unknown error occurred')
      expect(result.raw).toBe('oops')
    })

    it('normalizes null to internal_error', () => {
      const result = normalizeToSDKError(null)

      expect(result.category).toBe('internal_error')
      expect(result.message).toBe('An unknown error occurred')
    })
  })
})
