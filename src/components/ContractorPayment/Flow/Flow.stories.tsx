import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentFlow } from './Flow'

export default {
  title: 'ContractorPayment / Flow',
} satisfies StoryDefault

export const CompleteFlow: Story = () => {
  return <ContractorPaymentFlow companyId="test-company-123" onEvent={action('onEvent')} />
}

CompleteFlow.meta = {
  description:
    'Complete contractor payment flow with payment history, creation, and review screens',
}

export const WithDifferentCompany: Story = () => {
  return <ContractorPaymentFlow companyId="different-company-456" onEvent={action('onEvent')} />
}

WithDifferentCompany.meta = {
  description: 'Flow with different company ID for testing',
}

export const MobileView: Story = () => {
  return (
    <div style={{ maxWidth: '375px', margin: '0 auto' }}>
      <ContractorPaymentFlow companyId="test-company-123" onEvent={action('onEvent')} />
    </div>
  )
}

MobileView.meta = {
  description: 'Contractor payment flow optimized for mobile viewing (375px width)',
}
