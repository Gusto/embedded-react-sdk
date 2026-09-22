import { TransitionPayroll } from '../TransitionPayroll'
import type { PayrollFlowContextInterface } from '../PayrollFlow/PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Flow context shape carried through the transition payroll macro state machine.
 *
 * @remarks
 * Extends {@link PayrollFlowContextInterface} so the payroll-execution reducers reused by the
 * transition machine (overview, edit-employee, receipts, blockers) typecheck against a single
 * shared context shape.
 *
 * @internal
 */
export interface TransitionFlowContextInterface extends PayrollFlowContextInterface {
  /** Start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** End date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** UUID of the pay schedule the transition is associated with. */
  payScheduleUuid: string
}

/**
 * Props for {@link TransitionFlow}.
 *
 * @public
 */
export interface TransitionFlowProps {
  /** Company running the transition payroll. */
  companyId: string
  /** Start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** End date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** UUID of the pay schedule the transition is associated with. */
  payScheduleUuid: string
  /** Whether reimbursement fields are shown throughout the flow. Defaults to `true`. */
  withReimbursements?: boolean
  /** Callback invoked for each event emitted by the flow and its child steps. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Renders {@link TransitionPayroll} as the entry step of {@link TransitionFlow}, wiring its events
 * up to the flow's state machine.
 *
 * @internal
 */
export function TransitionPayrollContextual() {
  const { companyId, startDate, endDate, payScheduleUuid, withReimbursements, onEvent } =
    useFlow<TransitionFlowContextInterface>()
  return (
    <TransitionPayroll
      companyId={ensureRequired(companyId)}
      startDate={ensureRequired(startDate)}
      endDate={ensureRequired(endDate)}
      payScheduleUuid={ensureRequired(payScheduleUuid)}
      withReimbursements={withReimbursements}
      onEvent={onEvent}
    />
  )
}
