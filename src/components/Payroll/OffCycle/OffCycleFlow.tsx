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
          header: {
            type: 'breadcrumbs' as const,
            breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
            currentBreadcrumbId: 'createOffCyclePayroll',
          },
        }),
      ),
    [companyId, payrollType, withReimbursements],
  )

  return <Flow machine={offCycleFlowMachine} onEvent={onEvent} />
}
