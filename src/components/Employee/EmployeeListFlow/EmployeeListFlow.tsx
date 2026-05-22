import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { employeeListStateMachine } from './employeeListStateMachine'
import {
  EmployeeListContextual,
  type EmployeeListFlowContextInterface,
  type EmployeeListFlowProps,
} from './EmployeeListFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const EmployeeListFlow = ({ companyId, onEvent }: EmployeeListFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'list',
        employeeListStateMachine,
        (initialContext: EmployeeListFlowContextInterface) => ({
          ...initialContext,
          component: EmployeeListContextual,
          companyId,
        }),
      ),
    [companyId],
  )
  return <Flow machine={machine} onEvent={onEvent} />
}
