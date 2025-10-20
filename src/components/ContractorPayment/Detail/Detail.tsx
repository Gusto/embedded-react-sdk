import { DetailPresentation } from './DetailPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { formatDateNamedWeekdayShortPlusDate } from '@/helpers/dateFormatting'

interface ContractorPaymentDetailProps
  extends BaseComponentInterface<'ContractorPayment.ContractorPaymentDetail'> {
  companyId: string
  date: string
}

export function ContractorPaymentDetail(
  props: ContractorPaymentDetailProps & BaseComponentInterface,
) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ onEvent, companyId, date, dictionary }: ContractorPaymentDetailProps) => {
  useComponentDictionary('ContractorPayment.ContractorPaymentDetail', dictionary)
  useI18n('ContractorPayment.ContractorPaymentDetail')

  // const { LoadingIndicator } = useBase()

  // Mock data from Screen 3
  const paymentsOnDate = [
    {
      id: '1',
      contractorName: 'Fitzgerald, Ella',
      hours: 10.0,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      total: 180,
    },
    {
      id: '2',
      contractorName: 'Armstrong, Louis',
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      total: 1000,
    },
  ]

  const onBack = () => {
    onEvent(componentEvents.BACK_TO_LIST)
  }

  const onViewPayment = (paymentId: string) => {
    // In real implementation, this would navigate to individual payment detail
  }

  const onCancelPayment = (paymentId: string) => {
    // In real implementation, this would cancel the payment
  }

  // const wrappedOnEvent: OnEventType<string, unknown> = (event, payload) => {
  //   onEvent(event as EventType, payload)
  // }

  const formattedDate = formatDateNamedWeekdayShortPlusDate(date)

  return (
    <DetailPresentation
      date={formattedDate || date}
      payments={paymentsOnDate}
      onBack={onBack}
      onViewPayment={onViewPayment}
      onCancelPayment={onCancelPayment}
    />
  )
}
