import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { offCycleMachine, offCycleBreadcrumbsNodes } from './offCycleStateMachine'
import {
  OffCycleReasonSelectionContextual,
  type OffCycleFlowContextInterface,
  type OffCycleFlowProps,
} from './OffCycleFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export function OffCycleFlow({ companyId, onEvent }: OffCycleFlowProps) {
  const offCycleFlowMachine = useMemo(
    () =>
      createMachine(
        'createOffCyclePayroll',
        offCycleMachine,
        (initialContext: OffCycleFlowContextInterface) => ({
          ...initialContext,
          component: OffCycleReasonSelectionContextual,
          companyId,
          breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
          currentBreadcrumbId: 'createOffCyclePayroll',
          progressBarType: 'breadcrumbs' as const,
        }),
      ),
    [companyId],
  )

  return <Flow machine={offCycleFlowMachine} onEvent={onEvent} />
}
