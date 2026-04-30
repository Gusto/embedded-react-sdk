import { PaymentMethodForm } from '../common/PaymentMethodForm'
import { BaseComponent } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface ContractorSelfPaymentMethodFormProps {
  contractorId: string
  onEvent: (...args: unknown[]) => void
}

export function ContractorSelfPaymentMethodForm(props: ContractorSelfPaymentMethodFormProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <PaymentMethodForm
        contractorId={props.contractorId}
        heading="Set up your payment method"
        description="Choose how you'd like to get paid."
        doneEvent={componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE}
        donePayload={{ contractorId: props.contractorId, selfOnboarding: true }}
      />
    </BaseComponent>
  )
}
