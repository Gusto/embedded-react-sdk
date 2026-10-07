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
 * Historical payroll with its derived rendering data and cancellation eligibility.
 *
 * @internal
 */
export interface PayrollHistoryItem extends Payroll {
  historyDetails: PayrollHistoryDetails
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
  return {
    payrollId: payroll.payrollUuid || payroll.uuid,
    totalAmount: calculateTotalPayroll(payroll),
    canCancel: canCancelPayroll(payroll),
    wireInRequest: wireInRequests.find(wire => wire.paymentUuid === payroll.payrollUuid),
  }
}
