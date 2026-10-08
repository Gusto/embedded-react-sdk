import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { calculateTotalPayroll, canCancelPayroll } from '../../helpers'

/**
 * Derived values for rendering a payroll history row without duplicating payroll rules.
 *
 * @internal
 */
export interface PayrollHistoryDetails {
  payrollId: string | undefined
  totalAmount: number
  canCancel: boolean
  wireInRequest: WireInRequest | undefined
}

/**
 * Resolves a historical payroll's identifier for row actions and cancellation.
 *
 * @param payroll - Payroll whose identifier should be resolved.
 * @returns The payroll UUID, fallback UUID, or `undefined` when neither is present.
 * @internal
 */
export function getPayrollHistoryId(payroll: Payroll): string | undefined {
  return payroll.payrollUuid || payroll.uuid || undefined
}

/**
 * Builds the existing history row values for both legacy and hook-backed consumers.
 *
 * @param payroll - The historical payroll to render.
 * @param wireInRequests - Company wire requests used to resolve the payroll's payment status.
 * @returns The payroll identifier, total, cancellation eligibility, and matching wire request.
 * @internal
 */
export function getPayrollHistoryDetails(
  payroll: Payroll,
  wireInRequests: WireInRequest[],
): PayrollHistoryDetails {
  const payrollId = getPayrollHistoryId(payroll)
  return {
    payrollId,
    totalAmount: calculateTotalPayroll(payroll),
    canCancel: !!payrollId && canCancelPayroll(payroll),
    wireInRequest: wireInRequests.find(wire => wire.paymentUuid === payroll.payrollUuid),
  }
}
