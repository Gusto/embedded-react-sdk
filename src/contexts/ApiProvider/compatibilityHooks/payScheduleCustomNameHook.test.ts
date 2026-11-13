import { describe, test, expect } from 'vitest'
import {
  PayScheduleListItem$inboundSchema,
  PayScheduleShow$inboundSchema,
} from '@gusto/embedded-api/models/components/payschedulelistitem'
import { payScheduleCustomNameHook } from './payScheduleCustomNameHook'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<typeof payScheduleCustomNameHook.afterSuccess>[0]

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req-1' },
  })

const LIST = 'get-v1-companies-company_id-pay_schedules'
const SHOW = 'get-v1-companies-company_id-pay_schedules-pay_schedule_id'
const CREATE = 'post-v1-companies-company_id-pay_schedules'
const UPDATE = 'put-v1-companies-company_id-pay_schedules-pay_schedule_id'

const paySchedule = (uuid: string, customName: string | null | undefined) => ({
  uuid,
  version: 'v1',
  frequency: 'Every week',
  ...(customName === undefined ? {} : { custom_name: customName }),
})

describe('payScheduleCustomNameHook', () => {
  test('passes unrelated operations through untouched', async () => {
    const response = jsonResponse(paySchedule('ps-1', null))

    const result = await payScheduleCustomNameHook.afterSuccess(context('getPayroll'), response)

    expect(result).toBe(response)
  })

  test('leaves a pay schedule list with only omitted/string names untouched', async () => {
    const response = jsonResponse([paySchedule('ps-1', undefined), paySchedule('ps-2', 'Sales')])

    const result = await payScheduleCustomNameHook.afterSuccess(context(LIST), response)

    expect(result).toBe(response)
  })

  test('strips a null custom_name from one item in a list without rejecting the rest', async () => {
    const response = jsonResponse([paySchedule('ps-1', null), paySchedule('ps-2', 'Sales')])

    const result = await payScheduleCustomNameHook.afterSuccess(context(LIST), response)

    expect(result).not.toBe(response)
    const body = (await result.json()) as Array<Record<string, unknown>>
    expect(body).toEqual([paySchedule('ps-1', undefined), paySchedule('ps-2', 'Sales')])
    expect(body.map(item => PayScheduleListItem$inboundSchema.safeParse(item).success)).toEqual([
      true,
      true,
    ])
  })

  test.each([SHOW, CREATE, UPDATE])(
    'strips a null custom_name from the %s response object so it parses',
    async operationID => {
      const response = jsonResponse(paySchedule('ps-1', null))

      const result = await payScheduleCustomNameHook.afterSuccess(context(operationID), response)

      expect(result).not.toBe(response)
      const body = (await result.json()) as Record<string, unknown>
      expect(body).toEqual(paySchedule('ps-1', undefined))
      expect(PayScheduleShow$inboundSchema.safeParse(body).success).toBe(true)
    },
  )

  test('preserves status and headers on a remapped response', async () => {
    const response = jsonResponse(paySchedule('ps-1', null))

    const result = await payScheduleCustomNameHook.afterSuccess(context(SHOW), response)

    expect(result.status).toBe(200)
    expect(result.headers.get('x-request-id')).toBe('req-1')
  })
})
