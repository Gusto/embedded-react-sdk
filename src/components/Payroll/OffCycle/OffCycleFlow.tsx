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
  payrollType,
  onEvent,
  withReimbursements,
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
          payrollType,
          withReimbursements,
          breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
          currentBreadcrumbId: 'createOffCyclePayroll',
          progressBarType: 'breadcrumbs' as const,
        }),
      ),
    [companyId, payrollType, withReimbursements],
  )

  return <Flow machine={offCycleFlowMachine} onEvent={onEvent} />
}
