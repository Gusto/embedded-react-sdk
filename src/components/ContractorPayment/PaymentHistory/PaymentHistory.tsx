import { useState } from 'react'
import { PaymentHistoryPresentation } from './PaymentHistoryPresentation'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

interface ContractorPaymentPaymentHistoryProps extends BaseComponentInterface {
  companyId: string
  bannerMessage?: string
  bannerType?: 'success' | 'error' | 'warning' | 'info'
}

// Mock data to match GWS Flows screens
const mockPaymentHistory = [
  {
    paymentDate: '2025-09-17',
    reimbursementTotal: 0,
    wageTotal: 1180,
    contractorsCount: 2,
  },
]

const mockEmptyHistory: typeof mockPaymentHistory = []

export const ContractorPaymentPaymentHistory = ({
  companyId,
  onEvent,
  bannerMessage,
  bannerType,
}: ContractorPaymentPaymentHistoryProps) => {
  const [selectedDateRange, setSelectedDateRange] = useState('Last 3 months')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Simulate showing success message after payment creation
  const paymentHistory = showSuccessMessage ? mockPaymentHistory : mockEmptyHistory

  const onCreatePayment = () => {
    setShowSuccessMessage(false)
    onEvent(componentEvents.CREATE_PAYMENT_SELECTED)
  }

  const onDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange)
  }

  const onDateSelected = (date: string) => {
    onEvent(componentEvents.DATE_SELECTED, { date })
  }

  return (
    <BaseComponent onEvent={onEvent}>
      <PaymentHistoryPresentation
        paymentHistory={paymentHistory}
        selectedDateRange={selectedDateRange}
        onCreatePayment={onCreatePayment}
        onDateRangeChange={onDateRangeChange}
        onDateSelected={onDateSelected}
        showSuccessMessage={showSuccessMessage}
        bannerMessage={bannerMessage}
        bannerType={bannerType}
      />
    </BaseComponent>
  )
}
