import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import { payrollLandingMachine, payrollLandingBreadcrumbNodes } from './payrollLandingStateMachine'
import {
  PayrollLandingTabsContextual,
  type PayrollLandingFlowContextInterface,
  type PayrollLandingFlowProps,
} from './PayrollLandingFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

/**
 * Props for {@link PayrollLanding}.
 *
 * @public
 */
export interface PayrollLandingProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  /** The associated company identifier. */
  companyId: string
  /** Whether to show reimbursement fields throughout the landing flow. Defaults to `true`. */
  withReimbursements?: boolean
  /** Custom component that replaces the default wire details confirmation UI. */
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  /** When `true`, displays a dismissible success alert indicating a payroll was cancelled. */
  showPayrollCancelledAlert?: boolean
}

/**
 * Main landing surface for payroll operations, with tabs for running payroll and
 * viewing payroll history, plus inline navigation to a payroll's overview and receipt.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/selected` | User selected a payroll to run | `{ payrollUuid: string, payPeriod: object }` |
 * | `payroll/review` | User selected a calculated payroll to review | `{ payrollUuid: string, payPeriod: object }` |
 * | `payroll/skipped` | A payroll was skipped | `{ payrollId: string }` |
 * | `payroll/deleted` | A cancellable off-cycle payroll was deleted | `{ payrollId: string }` |
 * | `runPayroll/offCycle/start` | User clicked the Run off-cycle call-to-action | — |
 * | `transition/runPayroll` | User chose to run an unprocessed transition payroll from the Transition Payroll Alert | `{ startDate: string, endDate: string, payScheduleUuid?: string }` |
 * | `transition/payrollSkipped` | User skipped an unprocessed transition payroll from the Transition Payroll Alert | `{ startDate: string, endDate: string, payScheduleUuid?: string }` |
 * | `runPayroll/summary/viewed` | User opened a payroll's summary view | `{ payrollId: string }` |
 * | `runPayroll/receipt/viewed` | User opened a payroll's receipt view | `{ payrollId: string }` |
 * | `runPayroll/blockers/viewAll` | User opened the full list of payroll blockers | — |
 * | `runPayroll/cancelled` | A payroll was cancelled | `{ payrollId: string, result: object }` |
 * | `runPayroll/cancelled/alertDismissed` | User dismissed the payroll-cancelled success alert | — |
 *
 * When unprocessed transition pay periods exist, the landing surface renders a Transition
 * Payroll Alert. It looks ahead 90 days for upcoming transition periods, groups them by pay
 * schedule, and offers to run or skip each one. Choosing to run emits `transition/runPayroll`
 * (handle it by rendering `Payroll.TransitionFlow` with the supplied dates and pay schedule).
 * Skipping opens a confirmation dialog — warning that employees will not be paid for the
 * period — then skips the payroll and emits `transition/payrollSkipped`. Transition pay
 * periods should be resolved (run or skipped) before regular payrolls are run; the Gusto API
 * may reject regular payrolls while unresolved transition periods exist.
 *
 * @param props - See {@link PayrollLandingProps}.
 * @returns The payroll landing flow.
 * @public
 */
export function PayrollLanding(props: PayrollLandingProps) {
  return (
    <BaseComponent {...props}>
      <PayrollLandingFlow {...props} />
    </BaseComponent>
  )
}

function PayrollLandingFlow({
  companyId,
  onEvent,
  dictionary,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  showPayrollCancelledAlert,
}: PayrollLandingFlowProps) {
  useComponentDictionary('Payroll.PayrollLanding', dictionary)

  const machine = useMemo(
    () =>
      createMachine(
        'tabs',
        payrollLandingMachine,
        (initialContext: PayrollLandingFlowContextInterface) => ({
          ...initialContext,
          component: PayrollLandingTabsContextual,
          companyId,
          selectedTab: 'run-payroll',
          withReimbursements,
          ConfirmWireDetailsComponent,
          header: {
            type: 'breadcrumbs' as const,
            breadcrumbs: buildBreadcrumbs(payrollLandingBreadcrumbNodes),
          },
          showPayrollCancelledAlert,
        }),
      ),
    [companyId, withReimbursements, ConfirmWireDetailsComponent, showPayrollCancelledAlert],
  )

  return <Flow onEvent={onEvent} machine={machine} />
}
