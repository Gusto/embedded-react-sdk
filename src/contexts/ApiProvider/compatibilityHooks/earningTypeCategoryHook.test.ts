import { describe, test, expect } from 'vitest'
import { EarningTypeList$inboundSchema } from '@gusto/embedded-api/models/components/earningtypelist'
import { earningTypeCategoryHook } from './earningTypeCategoryHook'

const EARNING_TYPES_LIST = 'get-v1-companies-company_id-earning_types'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<typeof earningTypeCategoryHook.afterSuccess>[0]

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req-1' },
  })

const earningType = (uuid: string, category?: string) => ({
  uuid,
  name: `Earning ${uuid}`,
  active: true,
  included_in_overtime_pay: true,
  ...(category === undefined ? {} : { category }),
})

describe('earningTypeCategoryHook', () => {
  // Proves the hook is load-bearing: one unlisted category rejects the entire list, including the
  // valid `default` entry alongside it, which is what fails the payroll editor's earning-types query.
  test('the unpatched response does not parse', () => {
    const raw = {
      default: [earningType('et-1', 'Commission')],
      custom: [earningType('et-2', 'FlatSumBonus')],
    }

    expect(EarningTypeList$inboundSchema.safeParse(raw).success).toBe(false)
  })

  test('passes unrelated operations through untouched', async () => {
    const response = jsonResponse({ custom: [earningType('et-1', 'FlatSumBonus')] })

    const result = await earningTypeCategoryHook.afterSuccess(
      context('get-v1-companies-company_id-payrolls'),
      response,
    )

    expect(result).toBe(response)
  })

  test('leaves known and omitted categories untouched', async () => {
    const response = jsonResponse({
      default: [earningType('et-1')],
      custom: [earningType('et-2', 'Commission'), earningType('et-3')],
    })

    const result = await earningTypeCategoryHook.afterSuccess(context(EARNING_TYPES_LIST), response)

    expect(result).toBe(response)
  })

  test.each(['default', 'custom'])(
    'strips an unlisted category from the %s array so the list parses',
    async key => {
      const response = jsonResponse({ [key]: [earningType('et-1', 'FlatSumBonus')] })

      const result = await earningTypeCategoryHook.afterSuccess(
        context(EARNING_TYPES_LIST),
        response,
      )

      expect(result).not.toBe(response)
      const body = (await result.json()) as Record<string, unknown>
      expect(body).toEqual({ [key]: [earningType('et-1')] })
      expect(EarningTypeList$inboundSchema.safeParse(body).success).toBe(true)
    },
  )

  test('preserves the earning type and its siblings rather than dropping entries', async () => {
    const response = jsonResponse({
      default: [earningType('et-1', 'Commission')],
      custom: [earningType('et-2', 'FlatSumBonus'), earningType('et-3', 'CashTips')],
    })

    const result = await earningTypeCategoryHook.afterSuccess(context(EARNING_TYPES_LIST), response)

    const list = EarningTypeList$inboundSchema.parse(await result.json())

    expect(list.default).toEqual([
      {
        uuid: 'et-1',
        name: 'Earning et-1',
        active: true,
        includedInOvertimePay: true,
        category: 'Commission',
      },
    ])
    expect(list.custom).toEqual([
      { uuid: 'et-2', name: 'Earning et-2', active: true, includedInOvertimePay: true },
      {
        uuid: 'et-3',
        name: 'Earning et-3',
        active: true,
        includedInOvertimePay: true,
        category: 'CashTips',
      },
    ])
  })

  test('preserves status and headers on a remapped response', async () => {
    const response = jsonResponse({ custom: [earningType('et-1', 'FlatSumBonus')] })

    const result = await earningTypeCategoryHook.afterSuccess(context(EARNING_TYPES_LIST), response)

    expect(result.status).toBe(200)
    expect(result.headers.get('x-request-id')).toBe('req-1')
  })
})
