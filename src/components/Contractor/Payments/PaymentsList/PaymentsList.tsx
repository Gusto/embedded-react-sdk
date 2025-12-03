import { PaymentsListPresentation } from './PaymentsListPresentation'
import { useI18n, useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface PaymentsListProps extends BaseComponentInterface<'Contractor.Payments.PaymentsList'> {
  companyId: string
}

export function PaymentsList(props: PaymentsListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ companyId, dictionary, onEvent, children }: PaymentsListProps) => {
  useComponentDictionary('Contractor.Payments.PaymentsList', dictionary)
  useI18n('Contractor.Payments.PaymentsList')

  const onCreatePayment = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_CREATE)
  }
  return (
    <PaymentsListPresentation
      onCreatePayment={onCreatePayment}
      paymentsList={[]}
      selectedDateRange="Last 3 months"
      onDateRangeChange={() => {}}
      onDateSelected={() => {}}
      showSuccessMessage={false}
    />
  )
}
