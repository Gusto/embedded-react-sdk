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

/**
 * Multi-step flow for creating and running an off-cycle payroll (bonus or correction).
 *
 * @remarks
 * Guides the user through configuring pay period dates, selecting a reason, choosing
 * employees, and setting deduction and tax withholding preferences, then transitions
 * into the standard payroll execution experience (configuration, overview, submission,
 * receipts). All off-cycle payroll types share the same execution steps as regular
 * payrolls — only the creation step differs.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `breadcrumb/navigate` | User navigates via the flow breadcrumb header | `{ key: string }` |
 * | `offCycle/created` | Off-cycle payroll has been created and the flow transitions to execution | `{ payrollUuid: string }` |
 *
 * Once the flow transitions to execution, all standard run-payroll events are emitted
 * (e.g. `runPayroll/calculated`, `runPayroll/submitted`, `runPayroll/processed`).
 *
 * @components
 * - {@link OffCycleCreation}
 * - {@link PayrollExecutionFlow}
 *
 * @param props - {@link OffCycleFlowProps}
 * @returns The rendered off-cycle payroll flow.
 * @public
 *
 * @example
 * ```tsx
 * import { Payroll } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return <Payroll.OffCycleFlow companyId="your-company-id" onEvent={() => {}} />
 * }
 * ```
 */
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
