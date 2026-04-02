import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { timeOffMachine } from './timeOffStateMachine'
import type { TimeOffFlowProps, TimeOffFlowContextInterface } from './TimeOffFlowComponents'
import { PolicyListContextual } from './TimeOffFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const TimeOffFlow = ({ companyId, onEvent }: TimeOffFlowProps) => {
  const timeOffFlow = useMemo(
    () =>
      createMachine(
        'policyList',
        timeOffMachine,
        (initialContext: TimeOffFlowContextInterface) => ({
          ...initialContext,
          component: PolicyListContextual,
          companyId,
        }),
      ),
    [companyId],
  )
  return <Flow machine={timeOffFlow} onEvent={onEvent} />
}
