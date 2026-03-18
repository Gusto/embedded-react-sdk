import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { NotFoundErrorObject } from '@gusto/embedded-api/models/errors/notfounderrorobject'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { useBaseSubmit } from './useBaseSubmit'

const createMockHttpMeta = () => ({
  response: new Response('', { status: 404 }),
  request: new Request('https://api.gusto.com/test'),
  body: '{}',
})

describe('useBaseSubmit', () => {
  describe('baseSubmitHandler error handling', () => {
    it('catches APIError and sets SDKError with api_error category', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const apiError = new APIError('API error occurred', createMockHttpMeta())

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw apiError
        })
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.category).toBe('api_error')
      expect(result.current.error?.raw).toBe(apiError)
      expect(result.current.error?.httpStatus).toBe(404)
    })

    it('catches UnprocessableEntityErrorObject and extracts field errors', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const unprocessableError = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'payroll',
              category: 'invalid_operation',
              message: 'Payroll cannot be submitted due to RFI blockers',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw unprocessableError
        })
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.category).toBe('api_error')
      expect(result.current.error?.fieldErrors).toHaveLength(1)
      expect(result.current.error?.fieldErrors[0]).toEqual({
        field: 'payroll',
        category: 'invalid_operation',
        message: 'Payroll cannot be submitted due to RFI blockers',
        metadata: undefined,
      })
    })

    it('catches NotFoundErrorObject and extracts field errors from errors array', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const notFoundError = new NotFoundErrorObject(
        {
          errors: [
            {
              errorKey: 'payroll',
              category: 'not_found',
              message: 'Payroll not found or no longer submittable',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw notFoundError
        })
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.category).toBe('api_error')
      expect(result.current.error?.httpStatus).toBe(404)
      expect(result.current.error?.fieldErrors).toHaveLength(1)
      expect(result.current.error?.fieldErrors[0]?.message).toBe(
        'Payroll not found or no longer submittable',
      )
    })

    it('catches GustoEmbeddedError and sets SDKError', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const gustoError = new GustoEmbeddedError('Unexpected API error', createMockHttpMeta())

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw gustoError
        })
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.category).toBe('api_error')
      expect(result.current.error?.raw).toBe(gustoError)
    })

    it('extracts structured fieldErrors from payroll_blocker category', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const blockerError = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'base',
              category: 'payroll_blocker',
              message: 'Payroll is blocked due to an open information request',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw blockerError
        })
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.fieldErrors).toHaveLength(1)
      expect(result.current.error?.fieldErrors[0]?.message).toBe(
        'Payroll is blocked due to an open information request',
      )
      expect(result.current.error?.fieldErrors[0]?.category).toBe('payroll_blocker')
    })

    it('handles errors with no message field gracefully', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const errorWithoutMessage = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'base',
              category: 'payroll_blocker',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw errorWithoutMessage
        })
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.category).toBe('api_error')
      expect(result.current.error?.fieldErrors).toHaveLength(0)
    })

    it('clears error before each submission', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const apiError = new APIError('First error', createMockHttpMeta())

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw apiError
        })
      })

      expect(result.current.error).not.toBeNull()

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => Promise.resolve())
      })

      expect(result.current.error).toBeNull()
    })

    it('extracts multiple field errors from a single 422 response', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const multiFieldError = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'first_name',
              category: 'invalid_attribute_value',
              message: 'First name is required',
            },
            {
              errorKey: 'email',
              category: 'invalid_attribute_value',
              message: 'Email is not valid',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw multiFieldError
        })
      })

      expect(result.current.error?.fieldErrors).toHaveLength(2)
      expect(result.current.error?.fieldErrors[0]?.field).toBe('firstName')
      expect(result.current.error?.fieldErrors[1]?.field).toBe('email')
    })
  })
})
