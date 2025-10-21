import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentDetail } from './Detail'

export default {
  title: 'Domain/ContractorPayment/Payment Statement Detail',
} satisfies StoryDefault

export const PaymentDetailDefault: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

PaymentDetailDefault.meta = {
  description:
    'Payment Statement Detail showing detailed payment breakdown for a specific date with all contractors and payment components',
}

export const PaymentDetailEmpty: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-20"
      onEvent={action('onEvent')}
    />
  )
}

PaymentDetailEmpty.meta = {
  description:
    'Payment Statement Detail with no payments on the selected date - displays empty state',
}
