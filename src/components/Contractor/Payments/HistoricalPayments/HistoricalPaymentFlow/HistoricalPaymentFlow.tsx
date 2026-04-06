import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  historicalPaymentFlowBreadcrumbsNodes,
  historicalPaymentMachine,
} from './historicalPaymentStateMachine'
import {
  CreateHistoricalPaymentContextual,
  type HistoricalPaymentFlowContextInterface,
  type HistoricalPaymentFlowProps,
} from './HistoricalPaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export const HistoricalPaymentFlow = ({ companyId, onEvent }: HistoricalPaymentFlowProps) => {
  const historicalPaymentFlow = useMemo(
    () =>
      createMachine(
        'createHistoricalPayment',
        historicalPaymentMachine,
        (initialContext: HistoricalPaymentFlowContextInterface) => ({
          ...initialContext,
          component: CreateHistoricalPaymentContextual,
          companyId,
          progressBarType: null,
          breadcrumbs: buildBreadcrumbs(historicalPaymentFlowBreadcrumbsNodes),
          currentBreadcrumb: 'createHistoricalPayment',
        }),
      ),
    [companyId],
  )
  return <Flow machine={historicalPaymentFlow} onEvent={onEvent} />
}
