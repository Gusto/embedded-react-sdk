import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import { payrollLandingMachine, payrollLandingBreadcrumbNodes } from './payrollLandingStateMachine'
import {
  PayrollLandingTabsContextual,
  type PayrollLandingFlowContextInterface,
} from './PayrollLandingFlowComponents'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

interface UsePayrollLandingProps {
  companyId: string
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  showPayrollCancelledAlert?: boolean
}

export function usePayrollLanding({
  companyId,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  showPayrollCancelledAlert,
}: UsePayrollLandingProps) {
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
          breadcrumbs: buildBreadcrumbs(payrollLandingBreadcrumbNodes),
          currentBreadcrumbId: 'tabs',
          progressBarType: null,
          showPayrollCancelledAlert,
        }),
      ),
    [companyId, withReimbursements, ConfirmWireDetailsComponent, showPayrollCancelledAlert],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
