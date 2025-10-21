import type { ContractorPaymentFlowProps } from './ContractorPaymentFlowComponents'
import { ContractorPaymentFlow } from './Flow'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

export function ContractorPayment(props: ContractorPaymentFlowProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <ContractorPaymentFlow {...props} />
    </BaseComponent>
  )
}
