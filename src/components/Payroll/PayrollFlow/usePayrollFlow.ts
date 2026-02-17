import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { payrollFlowBreadcrumbsNodes, payrollMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import {
  SaveAndExitCta,
  PayrollLandingContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

type UsePayrollFlowProps = Pick<
  PayrollFlowProps,
  'companyId' | 'withReimbursements' | 'ConfirmWireDetailsComponent'
>

export function usePayrollFlow({
  companyId,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: UsePayrollFlowProps) {
  const machine = useMemo(
    () =>
      createMachine('landing', payrollMachine, (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        component: PayrollLandingContextual,
        companyId,
        progressBarType: null,
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumb: 'landing',
        progressBarCta: SaveAndExitCta,
        withReimbursements,
        ConfirmWireDetailsComponent,
      })),
    [companyId, withReimbursements, ConfirmWireDetailsComponent],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
