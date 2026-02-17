import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { paymentFlowBreadcrumbsNodes, paymentMachine } from './paymentStateMachine'
import {
  PaymentListContextual,
  type PaymentFlowContextInterface,
  type PaymentFlowProps,
} from './PaymentFlowComponents'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

type UseContractorPaymentFlowProps = Pick<PaymentFlowProps, 'companyId'>

export function useContractorPaymentFlow({ companyId }: UseContractorPaymentFlowProps) {
  const machine = useMemo(
    () =>
      createMachine('landing', paymentMachine, (initialContext: PaymentFlowContextInterface) => ({
        ...initialContext,
        component: PaymentListContextual,
        companyId,
        progressBarType: null,
        breadcrumbs: buildBreadcrumbs(paymentFlowBreadcrumbsNodes),
        currentBreadcrumb: 'landing',
      })),
    [companyId],
  )

  return {
    data: {},
    actions: {},
    meta: {
      machine,
    },
  }
}
