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
