import type { AfterSuccessHook } from '@/types/hooks'

const PAYROLL_OPERATIONS = new Set([
  'put-v1-companies-company_id-payrolls-payroll_id-prepare',
  'put-v1-companies-company_id-payrolls',
  'post-v1-companies-company_id-payrolls',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Normalizes string deduction amounts for payroll responses whose generated schema expects numbers.
 *
 * @remarks
 * API version 2026-06-15 returns decimal strings, including percentage deductions. The generated
 * prepare, update, and off-cycle response schemas still require numbers. Remove this compatibility
 * hook once those schemas match the API. Invalid amounts remain unchanged so validation rejects them.
 *
 * @internal
 */
export const payrollDeductionAmountHook: AfterSuccessHook = {
  afterSuccess: async (context, response) => {
    if (!PAYROLL_OPERATIONS.has(context.operationID)) return response

    let body: unknown
    try {
      body = await response.clone().json()
    } catch {
      return response
    }

    if (!isRecord(body) || !Array.isArray(body.employee_compensations)) return response

    let hasChanges = false
    for (const compensation of body.employee_compensations) {
      if (!isRecord(compensation) || !Array.isArray(compensation.deductions)) continue

      for (const deduction of compensation.deductions) {
        if (
          !isRecord(deduction) ||
          typeof deduction.amount !== 'string' ||
          !/^-?\d+(?:\.\d+)?$/.test(deduction.amount)
        ) {
          continue
        }

        const amount = Number(deduction.amount)
        if (!Number.isFinite(amount)) continue

        deduction.amount = amount
        hasChanges = true
      }
    }

    if (!hasChanges) return response

    const headers = new Headers(response.headers)
    headers.delete('content-length')
    return new Response(JSON.stringify(body), {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
