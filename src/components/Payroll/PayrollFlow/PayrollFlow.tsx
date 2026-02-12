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
          progressBarType: null,
          breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
          currentBreadcrumbId: 'landing',
          progressBarCta: SaveAndExitCta,
          withReimbursements,
          ConfirmWireDetailsComponent,
        }),
      ),
    [companyId, withReimbursements, ConfirmWireDetailsComponent],
  )

  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
