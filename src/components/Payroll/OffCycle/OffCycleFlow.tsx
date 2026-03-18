import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { offCycleMachine, offCycleBreadcrumbsNodes } from './offCycleStateMachine'
import {
  OffCycleCreationContextual,
  type OffCycleFlowContextInterface,
  type OffCycleFlowProps,
} from './OffCycleFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export function OffCycleFlow({
  companyId,
  onEvent,
  defaultSelectedEmployeeIds,
}: OffCycleFlowProps) {
  const offCycleFlowMachine = useMemo(
    () =>
      createMachine(
        'createOffCyclePayroll',
        offCycleMachine,
        (initialContext: OffCycleFlowContextInterface) => ({
          ...initialContext,
          component: OffCycleCreationContextual,
          companyId,
          defaultSelectedEmployeeIds,
          breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
          currentBreadcrumbId: 'createOffCyclePayroll',
          progressBarType: 'breadcrumbs' as const,
        }),
      ),
    [companyId, defaultSelectedEmployeeIds],
  )

  return <Flow machine={offCycleFlowMachine} onEvent={onEvent} />
}
