import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollFlowBreadcrumbsNodes, paymentMachine } from './paymentStateMachine'
import {
  PaymentListContextual,
  type PaymentFlowContextInterface,
  type PaymentFlowProps,
} from './PaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export const PaymentFlow = ({ companyId, onEvent }: PaymentFlowProps) => {
  const payrollFlow = useMemo(
    () =>
      createMachine('landing', paymentMachine, (initialContext: PaymentFlowContextInterface) => ({
        ...initialContext,
        component: PaymentListContextual,
        companyId,
        progressBarType: null, //landing step does not show progress bar/breadcrumbs
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumb: 'landing',
      })),
    [companyId],
  )
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
