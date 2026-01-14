import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payScheduleMachine } from './payScheduleStateMachine'
import type {
  ManagePayScheduleFlowProps,
  ManagePayScheduleFlowContextInterface,
} from './ManagePayScheduleFlowComponents'
import { ManagePayScheduleLandingContextual } from './ManagePayScheduleFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export function ManagePayScheduleFlow({ companyId, onEvent }: ManagePayScheduleFlowProps) {
  const managePayScheduleFlow = useMemo(
    () =>
      createMachine(
        'landing',
        payScheduleMachine,
        (initialContext: ManagePayScheduleFlowContextInterface) => ({
          ...initialContext,
          component: ManagePayScheduleLandingContextual,
          companyId,
          progressBarType: null,
        }),
      ),
    [companyId],
  )

  return <Flow machine={managePayScheduleFlow} onEvent={onEvent} />
}
