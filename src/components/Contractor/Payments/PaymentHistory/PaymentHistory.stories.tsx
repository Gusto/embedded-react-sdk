import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { PaymentHistoryPresentation } from './PaymentHistoryPresentation'

export default {
  title: 'Domain/ContractorPayment/Payment History',
} satisfies StoryDefault

export const PaymentHistoryEmpty: Story = () => {
  return (
    <PaymentHistoryPresentation
      paymentHistory={[]}
      selectedDateRange="Last 3 months"
      onCreatePayment={action('onCreatePayment')}
      onDateRangeChange={action('onDateRangeChange')}
      onDateSelected={action('onDateSelected')}
      showSuccessMessage={false}
    />
  )
}

PaymentHistoryEmpty.meta = {
  description: 'Payment history with no payments created yet - empty state',
}

export const PaymentHistoryWithData: Story = () => {
  const mockHistory = [
    {
      paymentDate: '2025-09-17',
      reimbursementTotal: 0,
      wageTotal: 1180,
      contractorsCount: 2,
    },
  ]

  return (
    <PaymentHistoryPresentation
      paymentHistory={mockHistory}
      selectedDateRange="Last 3 months"
      onCreatePayment={action('onCreatePayment')}
      onDateRangeChange={action('onDateRangeChange')}
      onDateSelected={action('onDateSelected')}
      showSuccessMessage={false}
    />
  )
}

PaymentHistoryWithData.meta = {
  description: 'Payment history displaying past payments',
}

export const PaymentHistoryWithMultiplePayments: Story = () => {
  const mockHistory = [
    {
      paymentDate: '2025-09-17',
      reimbursementTotal: 0,
      wageTotal: 1180,
      contractorsCount: 2,
    },
  ]

  return (
    <PaymentHistoryPresentation
      paymentHistory={mockHistory}
      selectedDateRange="Last 3 months"
      onCreatePayment={action('onCreatePayment')}
      onDateRangeChange={action('onDateRangeChange')}
      onDateSelected={action('onDateSelected')}
      showSuccessMessage={false}
    />
  )
}

PaymentHistoryWithMultiplePayments.meta = {
  description: 'Payment history with multiple past payment dates',
}
