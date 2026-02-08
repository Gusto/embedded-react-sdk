import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { offCycleMachine, offCycleBreadcrumbsNodes } from './offCycleStateMachine'
import {
  CreateOffCyclePayrollContextual,
  type OffCycleFlowProps,
  type OffCycleFlowContextInterface,
} from './OffCycleFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export const OffCycleFlow = ({ companyId, onEvent }: OffCycleFlowProps) => {
  const offCycleFlowMachine = useMemo(
    () =>
      createMachine(
        'createOffCyclePayroll',
        offCycleMachine,
        (initialContext: OffCycleFlowContextInterface) => ({
          ...initialContext,
          component: CreateOffCyclePayrollContextual,
          companyId,
          progressBarType: 'breadcrumbs' as const,
          breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
          currentBreadcrumbId: 'createOffCyclePayroll',
        }),
      ),
    [companyId],
  )

  return <Flow machine={offCycleFlowMachine} onEvent={onEvent} />
}
