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

export const PayrollFlow = ({ companyId, onEvent, defaultValues }: PayrollFlowProps) => {
  const payrollFlow = useMemo(
    () =>
      createMachine('landing', payrollMachine, (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        component: PayrollLandingContextual,
        companyId,
        defaultValues,
        progressBarType: null, //landing step does not show progress bar/breadcrumbs
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumb: 'landing',
        progressBarCta: SaveAndExitCta,
      })),
    [companyId, defaultValues],
  )
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
