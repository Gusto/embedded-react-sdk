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
      bannerMessage="Successfully created 2 contractor payments"
      bannerType="success"
    />
  )
}

PaymentHistoryWithData.meta = {
  description: 'Payment history displaying past payments with success banner',
}

export const PaymentHistoryWithMultiplePayments: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Successfully created 2 contractor payments"
      bannerType="success"
    />
  )
}

PaymentHistoryWithMultiplePayments.meta = {
  description: 'Payment history with multiple past payment dates and success notification',
}

export const PaymentHistoryError: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Failed to process payment for contractor John Doe. Please review and retry."
      bannerType="error"
    />
  )
}

PaymentHistoryError.meta = {
  description: 'Payment history showing error state with error banner',
}

export const PaymentHistoryWarning: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Some payments are pending review"
      bannerType="warning"
    />
  )
}

PaymentHistoryWarning.meta = {
  description: 'Payment history with warning state and warning banner',
}
