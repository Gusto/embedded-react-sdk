import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { contractorPaymentMachine } from './contractorPaymentStateMachine'
import type {
  ContractorPaymentFlowProps,
  ContractorPaymentFlowContextInterface,
} from './ContractorPaymentFlowComponents'
import { ContractorPaymentPaymentHistoryContextual } from './ContractorPaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const ContractorPaymentFlow = ({
  companyId,
  onEvent,
  defaultValues,
}: ContractorPaymentFlowProps) => {
  const flow = useMemo(
    () =>
      createMachine(
        'paymentHistory',
        contractorPaymentMachine,
        (initialContext: ContractorPaymentFlowContextInterface) => ({
          ...initialContext,
          component: ContractorPaymentPaymentHistoryContextual,
          companyId,
          defaultValues,
        }),
      ),
    [companyId, defaultValues],
  )
  return <Flow machine={flow} onEvent={onEvent} />
}
