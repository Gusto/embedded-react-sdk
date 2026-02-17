import type { PaymentFlowProps } from './PaymentFlowComponents'
import { useContractorPaymentFlow } from './useContractorPaymentFlow'
import { Flow } from '@/components/Flow/Flow'

export const PaymentFlow = ({ companyId, onEvent }: PaymentFlowProps) => {
  const {
    meta: { machine },
  } = useContractorPaymentFlow({ companyId })

  return <Flow machine={machine} onEvent={onEvent} />
}
