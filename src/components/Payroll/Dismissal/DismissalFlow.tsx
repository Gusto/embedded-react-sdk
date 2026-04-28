import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { dismissalMachine, dismissalBreadcrumbsNodes } from './dismissalStateMachine'
import {
  DismissalPayPeriodSelectionContextual,
  DismissalExecutionContextual,
  type DismissalFlowContextInterface,
  type DismissalFlowProps,
} from './DismissalFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent } from '@/components/Base/Base'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export function DismissalFlow({ companyId, employeeId, onEvent, payrollId }: DismissalFlowProps) {
  const dismissalFlowMachine = useMemo(() => {
    const shouldAutoAdvance = Boolean(payrollId) && Boolean(employeeId)
    const initialState = shouldAutoAdvance ? 'execution' : 'payPeriodSelection'
    const initialComponent = shouldAutoAdvance
      ? DismissalExecutionContextual
      : DismissalPayPeriodSelectionContextual

    return createMachine(
      initialState,
      dismissalMachine,
      (initialContext: DismissalFlowContextInterface) => ({
        ...initialContext,
        component: initialComponent,
        companyId,
        employeeId,
        payrollUuid: payrollId,
        header: {
          type: 'breadcrumbs' as const,
          breadcrumbs: buildBreadcrumbs(dismissalBreadcrumbsNodes),
          currentBreadcrumbId: shouldAutoAdvance ? undefined : 'payPeriodSelection',
        },
      }),
    )
  }, [companyId, employeeId, payrollId])

  return (
    <BaseComponent onEvent={onEvent}>
      <Flow machine={dismissalFlowMachine} onEvent={onEvent} />
    </BaseComponent>
  )
}
