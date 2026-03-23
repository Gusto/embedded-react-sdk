import { TransitionFlow } from '../Transition/TransitionFlow'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export function TransitionFlowContextual() {
  const { companyId, transitionStartDate, transitionEndDate, transitionPayScheduleUuid, onEvent } =
    useFlow<PayrollFlowContextInterface>()
  return (
    <TransitionFlow
      companyId={ensureRequired(companyId)}
      startDate={ensureRequired(transitionStartDate)}
      endDate={ensureRequired(transitionEndDate)}
      payScheduleUuid={ensureRequired(transitionPayScheduleUuid)}
      onEvent={onEvent}
    />
  )
}
