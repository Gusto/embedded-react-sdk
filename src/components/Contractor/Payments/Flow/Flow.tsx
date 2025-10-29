import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { paymentMachine } from './paymentStateMachine'
import type { PaymentFlowProps, PaymentFlowContextInterface } from './PaymentFlowComponents'
import { PaymentHistoryContextual } from './PaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const PaymentFlow = ({ companyId, onEvent, defaultValues }: PaymentFlowProps) => {
  const flow = useMemo(
    () =>
      createMachine(
        'paymentHistory',
        paymentMachine,
        (initialContext: PaymentFlowContextInterface) => ({
          ...initialContext,
          component: PaymentHistoryContextual,
          companyId,
          defaultValues,
        }),
      ),
    [companyId, defaultValues],
  )
  return <Flow machine={flow} onEvent={onEvent} />
}
