import type { PaymentFlowProps } from './PaymentFlowComponents'
import { PaymentFlow } from './Flow'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

export function ContractorPayments(props: PaymentFlowProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <PaymentFlow {...props} />
    </BaseComponent>
  )
}
