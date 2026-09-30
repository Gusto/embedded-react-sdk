import type { AfterSuccessHook } from '@/types/hooks'

const ASSIGNMENT_PREVIEW_OPERATION_ID =
  'post-v1-companies-company_id-pay_schedules-assignment_preview'

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
export const stripNullAssignmentPreviewFields: AfterSuccessHook = {
  afterSuccess: async (hookCtx, response) => {
    if (hookCtx.operationID !== ASSIGNMENT_PREVIEW_OPERATION_ID) {
      return response
    }

    const body = await response.clone().json()
    const changes = body?.employee_changes ?? []

    for (const change of changes) {
      if (change.transition_pay_period === null) {
        delete change.transition_pay_period
      }
      if (change.first_pay_period === null) {
        delete change.first_pay_period
      }
    }

    return new Response(JSON.stringify(body), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  },
}
