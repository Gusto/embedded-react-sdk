import { useState, useMemo } from 'react'
import { useContractorPaymentGroupsGetListSuspense } from '@gusto/embedded-api/react-query/contractorPaymentGroupsGetList'
import { PaymentsListPresentation } from './PaymentsListPresentation'
import { useComponentDictionary } from '@/i18n'
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

const calculateDateRange = (months: number = 3) => {
  const endDate = new Date()
  const startDate = new Date()

  startDate.setMonth(startDate.getMonth() - months)
  //Max allowed by the API is 12 months
  endDate.setMonth(endDate.getMonth() + (12 - months))

  return {
    startDate: startDate.toISOString().split('T')[0] || '',
    endDate: endDate.toISOString().split('T')[0] || '',
  }
}

export const Root = ({ companyId, dictionary, onEvent }: PaymentsListProps) => {
  useComponentDictionary('Contractor.Payments.PaymentsList', dictionary)

  const [numberOfMonths, setNumberOfMonths] = useState(3)

  const { startDate, endDate } = useMemo(() => calculateDateRange(numberOfMonths), [numberOfMonths])
  //TODO: upcoming payments are not included in the list for some reason, only processed payments are included
  //TODO: add pagination
  const { data } = useContractorPaymentGroupsGetListSuspense({
    companyId,
    startDate,
    endDate,
    page: 1,
    per: 10,
  })
  const contractorPayments = data.contractorPaymentGroupWithBlockers || []

  const onCreatePayment = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_CREATE)
  }

  const handleDateRangeChange = (numberOfMonths: number) => {
    setNumberOfMonths(numberOfMonths)
  }

  const onViewPayment = (paymentId: string) => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_VIEW, { paymentId })
  }

  return (
    <PaymentsListPresentation
      contractorPayments={contractorPayments}
      numberOfMonths={numberOfMonths}
      onCreatePayment={onCreatePayment}
      onDateRangeChange={handleDateRangeChange}
      onViewPayment={onViewPayment}
    />
  )
}
