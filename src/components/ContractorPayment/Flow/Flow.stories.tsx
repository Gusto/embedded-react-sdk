import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPayment } from './ContractorPayment'

export default {
  title: 'Domain/ContractorPayment/Complete Flow',
} satisfies StoryDefault

export const CompleteFlow: Story = () => {
  return <ContractorPayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CompleteFlow.meta = {
  description:
    'Complete contractor payment flow with payment history, creation, and review screens',
}

export const WithDifferentCompany: Story = () => {
  return <ContractorPayment companyId="different-company-456" onEvent={action('onEvent')} />
}

WithDifferentCompany.meta = {
  description: 'Flow with different company ID for testing',
}

export const MobileView: Story = () => {
  return (
    <div style={{ maxWidth: '375px', margin: '0 auto' }}>
      <ContractorPayment companyId="test-company-123" onEvent={action('onEvent')} />
    </div>
  )
}

MobileView.meta = {
  description: 'Contractor payment flow optimized for mobile viewing (375px width)',
}
