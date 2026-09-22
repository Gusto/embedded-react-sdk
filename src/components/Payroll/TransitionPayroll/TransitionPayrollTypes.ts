import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for {@link TransitionPayroll}.
 *
 * @public
 */
export interface TransitionPayrollProps extends BaseComponentInterface {
  /** The company running the transition payroll. */
  companyId: string
  /** The start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** The end date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** The UUID of the pay schedule the transition is associated with. */
  payScheduleUuid: string
  /** Whether reimbursement fields are shown on the configuration screen. Defaults to `true`. */
  withReimbursements?: boolean
}
