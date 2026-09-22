import { describe, test, expect } from 'vitest'
import { stripPartnerTosPayrollBlocker } from './stripPartnerTosPayrollBlocker'

const PAYROLL_BLOCKERS_OPERATION_ID = 'get-v1-companies-payroll-blockers-company_uuid'

const makeContext = (operationID: string) =>
  ({ operationID }) as Parameters<typeof stripPartnerTosPayrollBlocker.afterSuccess>[0]

describe('stripPartnerTosPayrollBlocker', () => {
  test('drops partner_tos_not_accepted blockers from the payroll-blockers response', async () => {
    const response = new Response(
      JSON.stringify([
        { key: 'partner_tos_not_accepted', message: 'Accept the terms of service' },
        { key: 'missing_bank_info', message: 'Add bank info' },
      ]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )

    const result = await stripPartnerTosPayrollBlocker.afterSuccess(
      makeContext(PAYROLL_BLOCKERS_OPERATION_ID),
      response,
    )

    expect(await result.json()).toEqual([{ key: 'missing_bank_info', message: 'Add bank info' }])
  })

  test('preserves the response status and headers when rewriting the body', async () => {
    const response = new Response(
      JSON.stringify([{ key: 'partner_tos_not_accepted', message: 'Accept the terms of service' }]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Gusto-API-Version': '2026-06-15' },
      },
    )

    const result = await stripPartnerTosPayrollBlocker.afterSuccess(
      makeContext(PAYROLL_BLOCKERS_OPERATION_ID),
      response,
    )

    expect(result.status).toBe(200)
    expect(result.headers.get('X-Gusto-API-Version')).toBe('2026-06-15')
    expect(await result.json()).toEqual([])
  })

  test('returns the original response untouched when no excluded blocker is present', async () => {
    const response = new Response(
      JSON.stringify([{ key: 'missing_bank_info', message: 'Add bank info' }]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )

    const result = await stripPartnerTosPayrollBlocker.afterSuccess(
      makeContext(PAYROLL_BLOCKERS_OPERATION_ID),
      response,
    )

    expect(result).toBe(response)
  })

  test('ignores responses from other operations', async () => {
    const response = new Response(
      JSON.stringify([{ key: 'partner_tos_not_accepted', message: 'Accept the terms of service' }]),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )

    const result = await stripPartnerTosPayrollBlocker.afterSuccess(
      makeContext('get-v1-payrolls-payroll_uuid'),
      response,
    )

    expect(result).toBe(response)
  })
})
