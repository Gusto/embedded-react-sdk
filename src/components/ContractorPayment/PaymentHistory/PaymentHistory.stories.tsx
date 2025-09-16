import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentPaymentHistory } from './PaymentHistory'

export default {
  title: 'ContractorPayment / PaymentHistory',
} satisfies StoryDefault

export const Default: Story = () => {
  return (
    <ContractorPaymentPaymentHistory companyId="test-company-123" onEvent={action('onEvent')} />
  )
}

Default.meta = {
  description: 'Contractor payment history with date filtering',
}

export const WithSuccessMessage: Story = () => {
  return (
    <ContractorPaymentPaymentHistory companyId="test-company-123" onEvent={action('onEvent')} />
  )
}

WithSuccessMessage.meta = {
  description: 'Payment history view showing success message after payment creation',
}

export const EmptyState: Story = () => {
  return (
    <ContractorPaymentPaymentHistory companyId="test-company-123" onEvent={action('onEvent')} />
  )
}

EmptyState.meta = {
  description: 'Payment history in empty state with no payment data',
}

export const WithData: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Payment processed successfully for 2 contractors"
      bannerType="success"
    />
  )
}

WithData.meta = {
  description: 'Payment history with data and success banner',
}

export const WithErrorBanner: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Failed to process payment for contractor John Doe. Please review and retry."
      bannerType="error"
    />
  )
}

WithErrorBanner.meta = {
  description: 'Payment history with error banner displayed',
}
