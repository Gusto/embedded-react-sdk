import { PaymentHistoryPresentation } from './PaymentHistoryPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

interface PaymentHistoryProps extends BaseComponentInterface<'Contractor.Payments.PaymentHistory'> {
  companyId: string
  paymentId: string
}

export function PaymentHistory(props: PaymentHistoryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, paymentId, dictionary, onEvent }: PaymentHistoryProps) => {
  useComponentDictionary('Contractor.Payments.PaymentHistory', dictionary)

  return (
    <>
      <PaymentHistoryPresentation
        date={'2025-12-17'}
        payments={[]}
        onBack={() => {}}
        onViewPayment={() => {}}
        onCancelPayment={() => {}}
      />
    </>
  )
}
