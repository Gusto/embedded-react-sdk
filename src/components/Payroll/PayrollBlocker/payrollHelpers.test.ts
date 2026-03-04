import { describe, expect, it } from 'vitest'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import {
  payrollSubmitHandler,
  parsePayrollBlockersFromError,
  type ApiPayrollBlocker,
} from './payrollHelpers'

const createMockHttpMeta = () => ({
  response: new Response('', { status: 422 }),
  request: new Request('https://api.gusto.com/test'),
  body: '{}',
})

describe('payrollHelpers', () => {
  describe('payrollSubmitHandler', () => {
    it('returns success when handler resolves', async () => {
      const result = await payrollSubmitHandler(async () => {})

      expect(result).toEqual({ success: true, blockers: [] })
    })

    it('returns blockers when handler throws UnprocessableEntityErrorObject with payroll_blocker', async () => {
      const error = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'base',
              category: 'payroll_blocker',
              message: 'Payroll is blocked due to an open information request',
              metadata: { key: 'pending_information_request' },
            },
          ],
        },
        createMockHttpMeta(),
      )

      const result = await payrollSubmitHandler(async () => {
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.blockers).toHaveLength(1)
      expect(result.blockers[0]).toEqual({
        key: 'pending_information_request',
        message: 'Payroll is blocked due to an open information request',
      })
    })

    it('rethrows when handler throws non-payroll-blocker error', async () => {
      const otherError = new Error('Network error')

      await expect(
        payrollSubmitHandler(async () => {
          throw otherError
        }),
      ).rejects.toThrow('Network error')
    })
  })

  describe('parsePayrollBlockersFromError', () => {
    it('parses UnprocessableEntityErrorObject with payroll_blocker into ApiPayrollBlocker[]', () => {
      const error = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'base',
              category: 'payroll_blocker',
              message: 'Open information request must be resolved',
              metadata: { key: 'pending_information_request' },
            },
          ],
        },
        createMockHttpMeta(),
      )

      const blockers: ApiPayrollBlocker[] = parsePayrollBlockersFromError(error)

      expect(blockers).toHaveLength(1)
      expect(blockers[0]).toEqual({
        key: 'pending_information_request',
        message: 'Open information request must be resolved',
      })
    })
  })
})
