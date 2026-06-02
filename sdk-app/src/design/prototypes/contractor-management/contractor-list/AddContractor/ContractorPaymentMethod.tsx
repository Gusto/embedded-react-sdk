import { PaymentMethodForm } from '../../../../components/contractor/management/PaymentMethodForm/PaymentMethodForm'
import { BaseComponent } from '@/components/Base'

interface ContractorPaymentMethodProps {
  contractorId: string
  onEvent: (eventType: string, data?: unknown) => void
}

export function ContractorPaymentMethod(props: ContractorPaymentMethodProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <PaymentMethodForm contractorId={props.contractorId} heading="Payment method" />
    </BaseComponent>
  )
}
