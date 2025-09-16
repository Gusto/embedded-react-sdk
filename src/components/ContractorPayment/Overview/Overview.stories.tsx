import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { Overview } from './Overview'

export default {
  title: 'ContractorPayment / Overview',
} satisfies StoryDefault

export const Default: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

Default.meta = {
  description: 'Payment overview screen for reviewing and submitting payments',
}

export const WithDifferentPaymentGroup: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-456"
      onEvent={action('onEvent')}
    />
  )
}

WithDifferentPaymentGroup.meta = {
  description: 'Overview with different payment group data',
}

export const NormalState: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

NormalState.meta = {
  description: 'Normal overview state with payment summary ready for submission',
}

export const WithErrors: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

WithErrors.meta = {
  description: 'Overview with processing errors displayed',
}

export const WithWarnings: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

WithWarnings.meta = {
  description: 'Overview with validation warnings shown',
}
