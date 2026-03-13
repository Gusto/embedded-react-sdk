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
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export function DismissalFlow({ companyId, employeeId, onEvent, payrollId }: DismissalFlowProps) {
  const dismissalFlowMachine = useMemo(() => {
    const hasPayroll = Boolean(payrollId)
    const initialState = hasPayroll ? 'execution' : 'payPeriodSelection'
    const initialComponent = hasPayroll
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
        breadcrumbs: buildBreadcrumbs(dismissalBreadcrumbsNodes),
        currentBreadcrumbId: hasPayroll ? undefined : 'payPeriodSelection',
        progressBarType: hasPayroll ? null : ('breadcrumbs' as const),
      }),
    )
  }, [companyId, employeeId, payrollId])

  return <Flow machine={dismissalFlowMachine} onEvent={onEvent} />
}
