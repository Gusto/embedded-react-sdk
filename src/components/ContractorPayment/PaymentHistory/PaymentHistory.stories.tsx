import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentPaymentHistory } from './PaymentHistory'

export default {
  title: 'Domain/ContractorPayment/Payment History',
} satisfies StoryDefault

export const PaymentHistoryEmpty: Story = () => {
  return (
    <ContractorPaymentPaymentHistory companyId="test-company-123" onEvent={action('onEvent')} />
  )
}

PaymentHistoryEmpty.meta = {
  description: 'Payment history with no payments created yet - empty state',
}

export const PaymentHistoryWithData: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      initialShowData={true}
    />
  )
}

PaymentHistoryWithData.meta = {
  description: 'Payment history displaying past payments',
}

export const PaymentHistoryWithMultiplePayments: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      initialShowData={true}
    />
  )
}

PaymentHistoryWithMultiplePayments.meta = {
  description: 'Payment history with multiple past payment dates',
}
