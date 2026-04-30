import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { paymentFlowBreadcrumbsNodes, paymentMachine } from './paymentStateMachine'
import {
  PaymentListContextual,
  type PaymentFlowContextInterface,
  type PaymentFlowProps,
} from './PaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export const PaymentFlow = ({ companyId, onEvent }: PaymentFlowProps) => {
  const paymentFlow = useMemo(
    () =>
      createMachine('landing', paymentMachine, (initialContext: PaymentFlowContextInterface) => ({
        ...initialContext,
        component: PaymentListContextual,
        companyId,
        header: {
          type: 'breadcrumbs' as const,
          breadcrumbs: buildBreadcrumbs(paymentFlowBreadcrumbsNodes),
        },
      })),
    [companyId],
  )
  return <Flow machine={paymentFlow} onEvent={onEvent} />
}
