import { describe, test, expect } from 'vitest'
import { PayScheduleAssignmentPreview$inboundSchema } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import { payScheduleAssignmentPreviewHook } from './payScheduleAssignmentPreviewHook'

const ASSIGNMENT_PREVIEW = 'post-v1-companies-company_id-pay_schedules-assignment_preview'

const context = (operationID: string) =>
  ({ operationID }) as Parameters<typeof payScheduleAssignmentPreviewHook.afterSuccess>[0]

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req-1' },
  })

const payPeriod = {
  start_date: '2026-01-01',
  end_date: '2026-01-15',
  check_date: '2026-01-20',
}

const employeeChange = (
  uuid: string,
  periods: { firstPayPeriod?: unknown; transitionPayPeriod?: unknown },
) => ({
  employee_uuid: uuid,
  first_name: 'Ada',
  last_name: 'Lovelace',
  pay_frequency: 'Every week',
  ...('firstPayPeriod' in periods ? { first_pay_period: periods.firstPayPeriod } : {}),
  ...('transitionPayPeriod' in periods
    ? { transition_pay_period: periods.transitionPayPeriod }
    : {}),
})

describe('payScheduleAssignmentPreviewHook', () => {
  test('passes unrelated operations through untouched', async () => {
    const response = jsonResponse({
      employee_changes: [employeeChange('ee-1', { transitionPayPeriod: null })],
    })

    const result = await payScheduleAssignmentPreviewHook.afterSuccess(
      context('get-v1-companies-company_id-pay_schedules'),
      response,
    )

    expect(result).toBe(response)
  })

  test('leaves a preview whose pay periods are present or omitted untouched', async () => {
    const response = jsonResponse({
      type: 'single',
      employee_changes: [
        employeeChange('ee-1', { firstPayPeriod: payPeriod }),
        employeeChange('ee-2', {}),
      ],
    })

    const result = await payScheduleAssignmentPreviewHook.afterSuccess(
      context(ASSIGNMENT_PREVIEW),
      response,
    )

    expect(result).toBe(response)
  })

  test('strips null pay periods so the preview parses', async () => {
    const response = jsonResponse({
      type: 'single',
      employee_changes: [
        employeeChange('ee-1', { firstPayPeriod: payPeriod, transitionPayPeriod: null }),
        employeeChange('ee-2', { firstPayPeriod: null, transitionPayPeriod: null }),
      ],
    })

    const result = await payScheduleAssignmentPreviewHook.afterSuccess(
      context(ASSIGNMENT_PREVIEW),
      response,
    )

    expect(result).not.toBe(response)
    const body = (await result.json()) as Record<string, unknown>
    expect(body).toEqual({
      type: 'single',
      employee_changes: [
        employeeChange('ee-1', { firstPayPeriod: payPeriod }),
        employeeChange('ee-2', {}),
      ],
    })
    expect(PayScheduleAssignmentPreview$inboundSchema.safeParse(body).success).toBe(true)
  })

  test('preserves status and headers on a remapped response', async () => {
    const response = jsonResponse({
      employee_changes: [employeeChange('ee-1', { transitionPayPeriod: null })],
    })

    const result = await payScheduleAssignmentPreviewHook.afterSuccess(
      context(ASSIGNMENT_PREVIEW),
      response,
    )

    expect(result.status).toBe(200)
    expect(result.headers.get('x-request-id')).toBe('req-1')
  })
})
