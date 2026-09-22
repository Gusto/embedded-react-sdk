import { TransitionCreation } from '../TransitionCreation'
import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Flow context shape carried through the {@link TransitionPayroll} state machine.
 *
 * @internal
 */
export interface TransitionPayrollContextInterface extends FlowContextInterface {
  /** Company the transition payroll belongs to. */
  companyId: string
  /** Start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** End date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** UUID of the pay schedule the transition is associated with. */
  payScheduleUuid: string
  /** UUID of the transition payroll once it has been resolved or created. */
  payrollUuid?: string
  /** Whether reimbursement fields are shown on the configuration screen. Defaults to `true`. */
  withReimbursements?: boolean
}

/** @internal */
export function TransitionCreationContextual() {
  const { companyId, startDate, endDate, payScheduleUuid, onEvent } =
    useFlow<TransitionPayrollContextInterface>()
  return (
    <TransitionCreation
      companyId={ensureRequired(companyId)}
      startDate={ensureRequired(startDate)}
      endDate={ensureRequired(endDate)}
      payScheduleUuid={ensureRequired(payScheduleUuid)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function PayrollConfigurationContextual() {
  const { companyId, payrollUuid, onEvent, withReimbursements } =
    useFlow<TransitionPayrollContextInterface>()
  return (
    <PayrollConfiguration
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      onEvent={onEvent}
      withReimbursements={withReimbursements}
    />
  )
}
