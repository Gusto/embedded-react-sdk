import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentDetail } from './Detail'

export default {
  title: 'ContractorPayment / Detail',
} satisfies StoryDefault

export const Default: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

Default.meta = {
  description: 'Payment detail view for a specific date showing individual contractor payments',
}

export const DifferentDate: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-15"
      onEvent={action('onEvent')}
    />
  )
}

DifferentDate.meta = {
  description: 'Detail view for a different payment date',
}

export const EmptyDate: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-20"
      onEvent={action('onEvent')}
    />
  )
}

EmptyDate.meta = {
  description: 'Detail view for a date with no payments',
}

export const NormalState: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

NormalState.meta = {
  description: 'Normal detail state with payment data displayed',
}

export const WithErrors: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

WithErrors.meta = {
  description: 'Detail view with processing errors shown',
}

export const WithNoData: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-20"
      onEvent={action('onEvent')}
    />
  )
}

WithNoData.meta = {
  description: 'Detail view with no payment data available',
}
