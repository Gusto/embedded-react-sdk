import { createResponseBodyHook, isRecord } from './createResponseBodyHook'

const ASSIGNMENT_PREVIEW_OPERATION_ID =
  'post-v1-companies-company_id-pay_schedules-assignment_preview'

const hasNullPayPeriod = (change: unknown): change is Record<string, unknown> =>
  isRecord(change) && (change.transition_pay_period === null || change.first_pay_period === null)

const stripNullPayPeriods = (change: Record<string, unknown>): Record<string, unknown> => {
  const next = { ...change }
  if (next.transition_pay_period === null) delete next.transition_pay_period
  if (next.first_pay_period === null) delete next.first_pay_period
  return next
}

/**
 * Temporary workaround for a Gusto-Partner-API spec gap: `transition_pay_period` and
 * `first_pay_period` on `Pay-Schedule-Assignment-Employee-Change` are bare `$ref`s with no
 * nullable branch, so the generated Zod schema rejects the `null` the backend legitimately
 * returns for an employee with no transition period. Strips those keys when null so the SDK's
 * response validation never sees them. Scoped to the assignment-preview operation only.
 * Remove once the OAS is fixed upstream or we use a client with lax mode.
 *
 * @internal
 */
export const payScheduleAssignmentPreviewHook = createResponseBodyHook(
  [ASSIGNMENT_PREVIEW_OPERATION_ID],
  body => {
    if (!isRecord(body) || !Array.isArray(body.employee_changes)) return undefined
    if (!body.employee_changes.some(hasNullPayPeriod)) return undefined

    return {
      ...body,
      employee_changes: body.employee_changes.map(change =>
        hasNullPayPeriod(change) ? stripNullPayPeriods(change) : change,
      ),
    }
  },
)
