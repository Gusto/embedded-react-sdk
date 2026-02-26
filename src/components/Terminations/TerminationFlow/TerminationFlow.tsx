import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { terminationMachine, terminationBreadcrumbNodes } from './terminationStateMachine'
import type {
  TerminationFlowProps,
  TerminationFlowContextInterface,
} from './TerminationFlowComponents'
import { TerminateEmployeeContextual } from './TerminationFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

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
          breadcrumbs: buildBreadcrumbs(terminationBreadcrumbNodes),
          currentBreadcrumbId: 'form',
          progressBarType: 'breadcrumbs' as const,
        }),
      ),
    [companyId, employeeId],
  )
  return <Flow machine={terminationFlow} onEvent={onEvent} />
}
