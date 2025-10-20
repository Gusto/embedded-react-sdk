import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { Overview } from './Overview'

export default {
  title: 'Domain/ContractorPayment/Payment Summary',
} satisfies StoryDefault

export const ReviewAndSubmitDefault: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

ReviewAndSubmitDefault.meta = {
  description:
    'Payment Summary page - final confirmation with payment summary details and all contractor payment information ready for submission',
}

export const ReviewAndSubmitWithErrors: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

ReviewAndSubmitWithErrors.meta = {
  description: 'Payment Summary page showing validation errors that prevent submission',
}

export const ReviewAndSubmitWithWarnings: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

ReviewAndSubmitWithWarnings.meta = {
  description:
    'Payment Summary page with warnings but allowing user to proceed (e.g., check payment method)',
}
