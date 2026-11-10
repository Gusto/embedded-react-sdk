import { describe, test, expect } from 'vitest'
import {
  OffCycleReasonType,
  Payroll$inboundSchema,
  PayrollShow$inboundSchema,
} from '@gusto/embedded-api/models/components/unprocessedpayroll'
import { payrollOffCycleReasonEnumHook } from './payrollOffCycleReasonEnumHook'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<typeof payrollOffCycleReasonEnumHook.afterSuccess>[0]

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req-1' },
  })

const LIST_PAYROLLS = 'get-v1-companies-company_id-payrolls'
const GET_PAYROLL = 'get-v1-companies-company_id-payrolls-payroll_id'

const offCyclePayroll = (uuid: string, offCycleReason: string | null) => ({
  payroll_uuid: uuid,
  off_cycle: true,
  off_cycle_reason: offCycleReason,
})

describe('payrollOffCycleReasonEnumHook', () => {
  test('passes non-payroll operations through untouched', async () => {
    const response = jsonResponse([offCyclePayroll('p1', 'Max out 401k')])

    const result = await payrollOffCycleReasonEnumHook.afterSuccess(
      context('get-information-requests'),
      response,
    )

    expect(result).toBe(response)
  })

  test('leaves a payroll list with only known reasons untouched', async () => {
    const response = jsonResponse([
      offCyclePayroll('p1', OffCycleReasonType.Bonus),
      offCyclePayroll('p2', null),
      { payroll_uuid: 'p3', off_cycle: false },
    ])

    const result = await payrollOffCycleReasonEnumHook.afterSuccess(
      context(LIST_PAYROLLS),
      response,
    )

    expect(result).toBe(response)
  })

  test('nulls unknown reasons in a payroll list so every payroll parses', async () => {
    const response = jsonResponse([
      offCyclePayroll('p1', 'Max out 401k'),
      offCyclePayroll('p2', OffCycleReasonType.Reversal),
      offCyclePayroll('p3', 'Other'),
    ])

    const result = await payrollOffCycleReasonEnumHook.afterSuccess(
      context(LIST_PAYROLLS),
      response,
    )

    const body = (await result.json()) as Array<Record<string, unknown>>
    expect(body).toEqual([
      offCyclePayroll('p1', null),
      offCyclePayroll('p2', OffCycleReasonType.Reversal),
      offCyclePayroll('p3', null),
    ])
    expect(body.map(payroll => Payroll$inboundSchema.safeParse(payroll).success)).toEqual([
      true,
      true,
      true,
    ])
  })

  test('nulls an unknown reason on a single payroll response so it parses', async () => {
    const response = jsonResponse(offCyclePayroll('p1', 'Max out 401k'))

    const result = await payrollOffCycleReasonEnumHook.afterSuccess(context(GET_PAYROLL), response)

    const body = (await result.json()) as Record<string, unknown>
    expect(body).toEqual(offCyclePayroll('p1', null))
    expect(PayrollShow$inboundSchema.safeParse(body).success).toBe(true)
  })

  test('preserves status and headers on a remapped response', async () => {
    const response = jsonResponse(offCyclePayroll('p1', 'Other'))

    const result = await payrollOffCycleReasonEnumHook.afterSuccess(context(GET_PAYROLL), response)

    expect(result.status).toBe(200)
    expect(result.headers.get('x-request-id')).toBe('req-1')
  })

  test('leaves a list operation with a non-array body untouched', async () => {
    const response = jsonResponse({ message: 'not an array' })

    const result = await payrollOffCycleReasonEnumHook.afterSuccess(
      context(LIST_PAYROLLS),
      response,
    )

    expect(result).toBe(response)
  })
})
