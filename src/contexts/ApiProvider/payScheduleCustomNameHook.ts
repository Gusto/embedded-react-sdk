import type { AfterSuccessHook } from '@/types/hooks'

const PAY_SCHEDULE_LIST_OPERATION_ID = 'get-v1-companies-company_id-pay_schedules'
const PAY_SCHEDULE_OBJECT_OPERATION_IDS: ReadonlySet<string> = new Set([
  'get-v1-companies-company_id-pay_schedules-pay_schedule_id',
  'post-v1-companies-company_id-pay_schedules',
  'put-v1-companies-company_id-pay_schedules-pay_schedule_id',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const hasNullCustomName = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && value.custom_name === null

const stripNullCustomName = (paySchedule: Record<string, unknown>): Record<string, unknown> => {
  const { custom_name: _customName, ...rest } = paySchedule
  return rest
}

const remapBody = (body: unknown, operationID: string): unknown => {
  if (operationID === PAY_SCHEDULE_LIST_OPERATION_ID) {
    if (!Array.isArray(body) || !body.some(hasNullCustomName)) return undefined
    return body.map(item => (hasNullCustomName(item) ? stripNullCustomName(item) : item))
  }

  return hasNullCustomName(body) ? stripNullCustomName(body) : undefined
}

/**
 * Temporary workaround for a pay-schedule response compatibility gap: `custom_name` is generated as
 * a non-nullable optional string (`z.string().optional()`) in `@gusto/embedded-api`, so a response
 * with `custom_name: null` throws an `SDKValidationError` -- rejecting the whole pay schedule list
 * response, not just the one affected item. This afterSuccess hook deletes an explicit
 * `custom_name: null` before the SDK's zod parse, collapsing it to the same "omitted" shape the
 * schema already accepts and that pay schedule display and form initialization already default to
 * an empty string for. Omission, valid strings, and unrelated fields are left untouched. Remove once
 * the generated client accepts `custom_name: null` directly.
 *
 * @internal
 */
export const payScheduleCustomNameHook: AfterSuccessHook = {
  afterSuccess: async (context, response) => {
    const isPayScheduleOperation =
      context.operationID === PAY_SCHEDULE_LIST_OPERATION_ID ||
      PAY_SCHEDULE_OBJECT_OPERATION_IDS.has(context.operationID)
    if (!isPayScheduleOperation) {
      return response
    }

    let body: unknown
    try {
      body = await response.clone().json()
    } catch {
      return response
    }

    const remapped = remapBody(body, context.operationID)
    if (remapped === undefined) return response

    const headers = new Headers(response.headers)
    headers.delete('content-length')
    return new Response(JSON.stringify(remapped), {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
