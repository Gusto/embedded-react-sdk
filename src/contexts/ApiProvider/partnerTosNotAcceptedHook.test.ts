import { describe, test, expect } from 'vitest'
import * as z from 'zod/v3'
import { PayrollBlocker$inboundSchema } from '@gusto/embedded-api/models/components/payrollblocker'
import { partnerTosNotAcceptedHook } from './partnerTosNotAcceptedHook'

const payrollBlockersSchema = z.array(PayrollBlocker$inboundSchema)

describe('partnerTosNotAcceptedHook', () => {
  const mockContext = {
    operationID: 'get-v1-companies-payroll-blockers-company_uuid',
  } as Parameters<typeof partnerTosNotAcceptedHook.afterSuccess>[0]

  test('remaps partner_tos_not_accepted so the response passes the SDK schema', async () => {
    const response = new Response(
      JSON.stringify([
        { key: 'partner_tos_not_accepted', message: 'Partner terms of service not accepted.' },
        {
          key: 'missing_bank_info',
          message: 'Company must have a bank account in order to run payroll.',
        },
      ]),
    )

    const result = await partnerTosNotAcceptedHook.afterSuccess(mockContext, response)
    const body: unknown = await result.json()

    expect(body).toMatchObject([
      { key: 'needs_approval', message: 'Partner terms of service not accepted.' },
      {
        key: 'missing_bank_info',
        message: 'Company must have a bank account in order to run payroll.',
      },
    ])

    expect(() => payrollBlockersSchema.parse(body)).not.toThrow()
  })

  test('rejects unremapped partner_tos_not_accepted at the SDK schema (proves the hook is necessary)', () => {
    const body = [
      { key: 'partner_tos_not_accepted', message: 'Partner terms of service not accepted.' },
    ]

    expect(() => payrollBlockersSchema.parse(body)).toThrow()
  })

  test('leaves the response untouched for other operations', async () => {
    const otherContext = { operationID: 'get-v1-companies-company_uuid' } as Parameters<
      typeof partnerTosNotAcceptedHook.afterSuccess
    >[0]
    const response = new Response(
      JSON.stringify([{ key: 'partner_tos_not_accepted', message: 'x' }]),
    )

    const result = await partnerTosNotAcceptedHook.afterSuccess(otherContext, response)

    expect(result).toBe(response)
  })

  test('remaps any key outside the closed enum, not just partner_tos_not_accepted', async () => {
    const response = new Response(
      JSON.stringify([
        {
          key: 'some_future_backend_key',
          message: 'A blocker the client does not know about yet.',
        },
      ]),
    )

    const result = await partnerTosNotAcceptedHook.afterSuccess(mockContext, response)
    const body: unknown = await result.json()

    expect(body).toMatchObject([
      { key: 'needs_approval', message: 'A blocker the client does not know about yet.' },
    ])
    expect(() => payrollBlockersSchema.parse(body)).not.toThrow()
  })

  test('leaves the response untouched when no blocker needs remapping', async () => {
    const response = new Response(
      JSON.stringify([{ key: 'missing_bank_info', message: 'Company must have a bank account.' }]),
    )

    const result = await partnerTosNotAcceptedHook.afterSuccess(mockContext, response)

    expect(result).toBe(response)
  })
})
