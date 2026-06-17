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

/**
 * Guided workflow for running a terminated employee's final payroll.
 *
 * @remarks
 * Presents unprocessed termination pay periods for the employee, creates an off-cycle payroll for the selected period with the `"Dismissed employee"` off-cycle reason, and then transitions into the standard payroll execution flow for configuration, review, submission, and receipts.
 *
 * When `payrollId` is provided, pay period selection is skipped and the flow starts directly at execution for that payroll. When omitted, the flow starts at pay period selection.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `dismissal/payPeriod/selected` | A pay period is selected and the dismissal payroll is created | `{ payrollUuid: string }` |
 *
 * Once the payroll is created, all standard run-payroll events (e.g. `runPayroll/calculated`, `runPayroll/submitted`, `runPayroll/processed`) are emitted during execution.
 *
 * @param props - {@link DismissalFlowProps} with the company, employee, optional payroll, and event handler.
 * @returns The composed dismissal payroll flow.
 * @public
 */
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
