import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import {
  ContractorPaymentFlow,
  ContractorPaymentPaymentHistory,
  ContractorPaymentCreatePayment,
  Overview,
  ContractorPaymentDetail,
  ContractorPaymentEditModal,
} from './index'

const mockContractor = {
  id: '1',
  name: 'Armstrong, Louis',
  wageType: 'Fixed' as const,
  paymentMethod: 'Direct Deposit' as const,
  hours: 0,
  wage: 1000,
  bonus: 0,
  reimbursement: 0,
  total: 1000,
}

export default {
  title: 'ContractorPayment / All Components',
} satisfies StoryDefault

export const Flow: Story = () => {
  return <ContractorPaymentFlow companyId="test-company-123" onEvent={action('onEvent')} />
}

Flow.meta = {
  description: 'Complete contractor payment flow',
}

export const PaymentHistory: Story = () => {
  return (
    <ContractorPaymentPaymentHistory companyId="test-company-123" onEvent={action('onEvent')} />
  )
}

PaymentHistory.meta = {
  description: 'Payment history component - empty state',
}

export const PaymentHistoryWithData: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Payment processed successfully for 2 contractors"
      bannerType="success"
    />
  )
}

PaymentHistoryWithData.meta = {
  description: 'Payment history component with data and success banner',
}

export const PaymentHistoryWithError: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Failed to process payment for contractor John Doe. Please review and retry."
      bannerType="error"
    />
  )
}

PaymentHistoryWithError.meta = {
  description: 'Payment history component with error banner',
}

export const CreatePayment: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePayment.meta = {
  description: 'Create payment component - normal state',
}

export const CreatePaymentNormal: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentNormal.meta = {
  description: 'Create payment component in normal state',
}

export const CreatePaymentWithRFI: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentWithRFI.meta = {
  description: 'Create payment component with RFI warning',
}

export const CreatePaymentWithValidation: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentWithValidation.meta = {
  description: 'Create payment component with validation errors',
}

export const OverviewScreen: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

OverviewScreen.meta = {
  description: 'Payment overview component - normal state',
}

export const OverviewNormal: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

OverviewNormal.meta = {
  description: 'Payment overview component in normal state',
}

export const OverviewWithErrors: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

OverviewWithErrors.meta = {
  description: 'Payment overview component with processing errors',
}

export const OverviewWithWarnings: Story = () => {
  return (
    <Overview
      companyId="test-company-123"
      paymentGroupId="payment-group-789"
      onEvent={action('onEvent')}
    />
  )
}

OverviewWithWarnings.meta = {
  description: 'Payment overview component with validation warnings',
}

export const DetailStory: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

DetailStory.meta = {
  description: 'Payment detail component - normal state',
}

export const DetailNormal: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

DetailNormal.meta = {
  description: 'Payment detail component in normal state',
}

export const DetailWithErrors: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

DetailWithErrors.meta = {
  description: 'Payment detail component with processing errors',
}

export const DetailWithNoData: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-20"
      onEvent={action('onEvent')}
    />
  )
}

DetailWithNoData.meta = {
  description: 'Payment detail component with no data available',
}

export const EditModalStory: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditModalStory.meta = {
  description: 'Contractor edit modal component - normal state',
}

export const EditModalNormal: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditModalNormal.meta = {
  description: 'Contractor edit modal component in normal state',
}

export const EditModalWithValidation: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditModalWithValidation.meta = {
  description: 'Contractor edit modal component with validation errors',
}

export const EditModalWithLoading: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditModalWithLoading.meta = {
  description: 'Contractor edit modal component in loading state',
}
