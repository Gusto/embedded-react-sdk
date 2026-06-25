import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollFlowBreadcrumbsNodes, payrollFlowMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import {
  SaveAndExitCta,
  PayrollLandingContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

/**
 * Guided workflow for selecting and running a company's payroll end to end.
 *
 * @remarks
 * Renders the payroll landing page and orchestrates the full run-payroll experience: selecting a payroll, configuring earnings and reimbursements, reviewing totals, submitting, and viewing receipts. Off-cycle, transition, and edit-employee steps are reachable from the same flow.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/selected` | A payroll is selected to run | `{ payrollId: string }` |
 * | `payroll/review` | A calculated payroll is opened for review | `{ payrollId: string }` |
 * | `runPayroll/calculated` | Payroll calculations complete | — |
 * | `runPayroll/edit` | The user returns to configuration to make changes | — |
 * | `runPayroll/employee/edit` | An employee row is opened for editing | `{ employeeId: string, firstName: string, lastName: string }` |
 * | `runPayroll/employee/saved` | Employee payroll changes are saved | `{ payrollPrepared: object, employee: object }` |
 * | `runPayroll/employee/cancelled` | Employee editing is cancelled | — |
 * | `runPayroll/submitted` | Payroll is successfully submitted | Response from the submit payroll endpoint |
 * | `runPayroll/processed` | Payroll processing completes | — |
 * | `runPayroll/processingFailed` | Payroll processing fails | Error details |
 * | `runPayroll/cancelled` | A submitted payroll is cancelled | `{ payrollId: string, result: object }` |
 * | `runPayroll/summary/viewed` | The summary screen is opened | `{ payrollId: string }` |
 * | `runPayroll/receipt/viewed` | The receipt screen is opened | `{ payrollId: string }` |
 * | `runPayroll/offCycle/start` | The user starts an off-cycle payroll | — |
 * | `transition/runPayroll` | The user starts a pending transition payroll | — |
 * | `payroll/saveAndExit` | The user clicks Save and Exit | — |
 *
 * @components
 * - {@link PayrollLanding}
 * - {@link PayrollExecutionFlow}
 * - {@link OffCycleFlow}
 * - {@link TransitionFlow}
 * - {@link PayrollBlockerList}
 * - {@link PayrollOverview}
 * - {@link PayrollReceipts}
 *
 * @param props - {@link PayrollFlowProps} with the company, optional reimbursements toggle, optional wire-details override, and event handler.
 * @returns The composed payroll flow.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { Payroll } from '@gusto/embedded-react-sdk'
 *
 * function RunPayrollPage() {
 *   return <Payroll.PayrollFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
 * }
 * ```
 */
export const PayrollFlow = ({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => {
  const payrollFlow = useMemo(
    () =>
      createMachine(
        'landing',
        payrollFlowMachine,
        (initialContext: PayrollFlowContextInterface) => ({
          ...initialContext,
          component: PayrollLandingContextual,
          companyId,
          header: {
            type: 'breadcrumbs' as const,
            breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
            cta: SaveAndExitCta,
          },
          withReimbursements,
          ConfirmWireDetailsComponent,
        }),
      ),
    [companyId, withReimbursements, ConfirmWireDetailsComponent],
  )

  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
