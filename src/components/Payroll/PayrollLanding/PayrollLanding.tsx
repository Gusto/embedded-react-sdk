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
 * | `runPayroll/summary/viewed` | User opened a payroll's summary view | `{ payrollId: string }` |
 * | `runPayroll/receipt/viewed` | User opened a payroll's receipt view | `{ payrollId: string }` |
 * | `runPayroll/blockers/viewAll` | User opened the full list of payroll blockers | — |
 * | `runPayroll/cancelled` | A payroll was cancelled | `{ payrollId: string, result: object }` |
 * | `runPayroll/cancelled/alertDismissed` | User dismissed the payroll-cancelled success alert | — |
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
