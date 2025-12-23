import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollFlowBreadcrumbsNodes, payrollMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import {
  SaveAndExitCta,
  PayrollLandingContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export const PayrollFlow = ({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => {
  const payrollFlow = useMemo(
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
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
