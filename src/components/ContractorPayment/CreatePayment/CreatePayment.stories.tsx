import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentCreatePayment } from './CreatePayment'

export default {
  title: 'ContractorPayment / CreatePayment',
} satisfies StoryDefault

export const Default: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

Default.meta = {
  description: 'Contractor payment creation screen for setting up new payments',
}

export const WithPaymentGroup: Story = () => {
  return (
    <ContractorPaymentCreatePayment
      companyId="test-company-123"
      paymentGroupId="payment-group-456"
      onEvent={action('onEvent')}
    />
  )
}

WithPaymentGroup.meta = {
  description: 'Create payment screen with existing payment group ID',
}

export const NormalState: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

NormalState.meta = {
  description: 'Normal create payment state with contractors ready for payment',
}

export const WithRFIWarning: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

WithRFIWarning.meta = {
  description: 'Create payment with RFI warning banner displayed',
}

export const WithValidationErrors: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

WithValidationErrors.meta = {
  description: 'Create payment with validation errors shown',
}
