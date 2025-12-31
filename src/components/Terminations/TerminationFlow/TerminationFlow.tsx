import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { terminationMachine } from './terminationStateMachine'
import type {
  TerminationFlowProps,
  TerminationFlowContextInterface,
} from './TerminationFlowComponents'
import { TerminateEmployeeContextual } from './TerminationFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const TerminationFlow = ({ companyId, employeeId, onEvent }: TerminationFlowProps) => {
  const terminationFlow = useMemo(
    () =>
      createMachine(
        'form',
        terminationMachine,
        (initialContext: TerminationFlowContextInterface) => ({
          ...initialContext,
          component: TerminateEmployeeContextual,
          companyId,
          employeeId,
        }),
      ),
    [companyId, employeeId],
  )
  return <Flow machine={terminationFlow} onEvent={onEvent} />
}
