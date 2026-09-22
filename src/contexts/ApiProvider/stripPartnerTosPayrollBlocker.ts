import type { AfterSuccessHook } from '@/types/hooks'

const PAYROLL_BLOCKERS_OPERATION_ID = 'get-v1-companies-payroll-blockers-company_uuid'

const EXCLUDED_BLOCKER_KEY = 'partner_tos_not_accepted'

/**
 * Temporary workaround for a Gusto-Partner-API spec gap: the `partner_tos_not_accepted` payroll
 * blocker value is deliberately excluded from client generation, so the generated Zod enum
 * (`Key` on `@gusto/embedded-api`'s `PayrollBlocker`) rejects it. When the backend returns that
 * blocker for a company, response validation throws and breaks every payroll flow page that reads
 * the company payroll blockers (e.g. `PayrollConfiguration`, `OffCycleCreation`). Drops any blocker
 * entry with that key so the SDK's response validation never sees it. Scoped to the payroll-blockers
 * operation only. Remove once the value is included in client generation or we use a client with lax
 * mode.
 *
 * @internal
 */
export const stripPartnerTosPayrollBlocker: AfterSuccessHook = {
  afterSuccess: async (hookCtx, response) => {
    if (hookCtx.operationID !== PAYROLL_BLOCKERS_OPERATION_ID) {
      return response
    }

    const body: unknown = await response.clone().json()

    if (!Array.isArray(body)) {
      return response
    }

    const filtered = body.filter(
      blocker =>
        !(
          typeof blocker === 'object' &&
          blocker !== null &&
          (blocker as { key?: unknown }).key === EXCLUDED_BLOCKER_KEY
        ),
    )

    if (filtered.length === body.length) {
      return response
    }

    return new Response(JSON.stringify(filtered), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  },
}
