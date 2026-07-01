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

/**
 * Guided flow to terminate an employee and arrange their final paycheck.
 *
 * @remarks
 * This is the flow for ending employment. It sets the termination date, decides how the final
 * paycheck is handled, and can launch the dismissal payroll as one option. To run the final payroll
 * on its own for an already-terminated employee, use {@link Payroll.DismissalFlow} directly.
 *
 * Provides a complete experience for terminating an employee — guides the user through selecting a termination date, choosing how to process final payroll, reviewing termination details, and managing the offboarding process. Drives a multi-step flow with breadcrumb navigation between the termination form, the summary, and the dismissal payroll flow (when the dismissal payroll option is selected).
 *
 * On mount, the flow detects existing terminations: if an active termination exists, the form is pre-populated for editing; if the employee is already terminated, the user is routed to the summary view.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/termination/created` | Fired when a new termination is created | `{ employeeId: string, effectiveDate: string, payrollOption: PayrollOption }` |
 * | `employee/termination/updated` | Fired when an existing termination is updated | `{ employeeId: string, effectiveDate: string, payrollOption: PayrollOption }` |
 * | `employee/termination/done` | Fired when the termination process is complete | `{ employeeId: string, effectiveDate: string, payrollOption: PayrollOption, payrollUuid?: string }` |
 * | `employee/termination/viewSummary` | Fired when viewing an existing termination summary | `{ employeeId: string, effectiveDate: string }` |
 * | `employee/termination/edit` | Fired when user clicks to edit termination details | `{ employeeId: string }` |
 * | `employee/termination/cancelled` | Fired when a termination is cancelled | `{ employeeId: string, alert?: `{@link TerminationFlowAlert}` }` |
 * | `employee/termination/runPayroll` | Fired when user chooses to run termination payroll | `{ employeeId: string, companyId: string, effectiveDate: string }` |
 * | `employee/termination/runOffCyclePayroll` | Fired when user chooses to run an off-cycle payroll | `{ employeeId: string, companyId: string }` |
 * | `employee/termination/payrollCreated` | Fired when an off-cycle payroll is created for termination | `{ employeeId: string, effectiveDate: string }` |
 * | `employee/termination/payrollFailed` | Fired when off-cycle payroll creation fails | `{ employeeId: string }` |
 *
 * The {@link PayrollOption} on each event identifies how the partner has chosen to handle the employee's final paycheck:
 *
 * - `dismissalPayroll` — Run a dismissal payroll (the most guided option). The flow swaps the employee's last regular payroll into a dismissal payroll with the termination date as the pay-period end and makes a default PTO payout recommendation.
 * - `regularPayroll` — Include the final pay in the employee's next scheduled regular payroll. The termination can still be cancelled after the fact.
 * - `anotherWay` — Handle the final pay another way: either run an off-cycle payroll to calculate final amounts, or pay the employee outside of Gusto (reporting it separately so the amounts land on tax forms). The employee is removed from unprocessed future payrolls, and the termination can still be cancelled after the fact.
 *
 * @components
 * - {@link TerminateEmployee}
 * - {@link TerminationSummary}
 * - {@link Payroll.DismissalFlow}
 * - {@link Payroll.PayrollLanding}
 *
 * @param props - See {@link TerminationFlowProps}.
 * @returns The multi-step termination workflow.
 * @public
 * @group Flow Components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { EmployeeManagement, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <EmployeeManagement.TerminationFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'employee/termination/done') {
 *           // Termination complete — navigate to your next screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
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
          header: {
            type: 'breadcrumbs' as const,
            breadcrumbs: buildBreadcrumbs(terminationBreadcrumbNodes),
            currentBreadcrumbId: 'form',
          },
        }),
      ),
    [companyId, employeeId],
  )
  return <Flow machine={terminationFlow} onEvent={onEvent} />
}
