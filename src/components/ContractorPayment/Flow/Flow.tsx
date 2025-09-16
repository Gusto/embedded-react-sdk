import { ContractorPaymentCreatePayment } from '../CreatePayment/CreatePayment'
import { ContractorPaymentPaymentHistory } from '../PaymentHistory/PaymentHistory'
import { Overview } from '../Overview/Overview'
import { ContractorPaymentDetail } from '../Detail/Detail'
import { ContractorPayment } from './ContractorPayment'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'

interface ContractorPaymentFlowProps extends BaseComponentInterface {
  companyId: string
}

export const ContractorPaymentFlow = ({
  companyId,
  onEvent,
  ...baseProps
}: ContractorPaymentFlowProps) => {
  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      <ContractorPayment
        companyId={companyId}
        CreatePayment={ContractorPaymentCreatePayment}
        PaymentHistory={ContractorPaymentPaymentHistory}
        Overview={Overview}
        Detail={ContractorPaymentDetail}
        onEvent={onEvent}
      />
    </BaseComponent>
  )
}
