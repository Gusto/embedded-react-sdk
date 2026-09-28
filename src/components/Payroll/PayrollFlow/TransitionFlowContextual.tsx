import { TransitionFlow } from '../Transition/TransitionFlow'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Adapts the `PayrollFlow` machine context to {@link TransitionFlow}'s props. The resolve/resume
 * lookup that used to live here now lives inside `TransitionPayroll`, so this is a thin bridge.
 *
 * @internal
 */
export function TransitionFlowContextual() {
  const {
    companyId,
    transitionStartDate,
    transitionEndDate,
    transitionPayScheduleUuid,
    withReimbursements,
    onEvent,
  } = useFlow<PayrollFlowContextInterface>()

  return (
    <TransitionFlow
      companyId={ensureRequired(companyId)}
      startDate={ensureRequired(transitionStartDate)}
      endDate={ensureRequired(transitionEndDate)}
      payScheduleUuid={ensureRequired(transitionPayScheduleUuid)}
      withReimbursements={withReimbursements}
      onEvent={onEvent}
    />
  )
}
