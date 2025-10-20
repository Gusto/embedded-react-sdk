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

const mockContractorHourly = {
  id: '2',
  name: 'Fitzgerald, Ella',
  wageType: 'Hourly' as const,
  hourlyRate: 18,
  paymentMethod: 'Check' as const,
  hours: 16,
  wage: 0,
  bonus: 350,
  reimbursement: 0,
  total: 638,
}

export default {
  title: 'ContractorPayment / All Screens',
} satisfies StoryDefault

// ============================================================================
// FLOW - Complete End-to-End Journey
// ============================================================================

export const CompleteFlow: Story = () => {
  return <ContractorPaymentFlow companyId="test-company-123" onEvent={action('onEvent')} />
}

CompleteFlow.meta = {
  description: 'Complete contractor payment flow from start to finish',
}

// ============================================================================
// PAYMENT HISTORY SCREEN (Screen 3 in Figma)
// ============================================================================

export const PaymentHistoryEmpty: Story = () => {
  return (
    <ContractorPaymentPaymentHistory companyId="test-company-123" onEvent={action('onEvent')} />
  )
}

PaymentHistoryEmpty.meta = {
  description: 'Payment history with no payments created yet',
}

export const PaymentHistoryWithData: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Successfully created 2 contractor payments"
      bannerType="success"
    />
  )
}

PaymentHistoryWithData.meta = {
  description: 'Payment history displaying past payments with success banner',
}

export const PaymentHistoryWithMultiplePayments: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Successfully created 2 contractor payments"
      bannerType="success"
    />
  )
}

PaymentHistoryWithMultiplePayments.meta = {
  description: 'Payment history with multiple past payment dates',
}

export const PaymentHistoryError: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Failed to process payment for contractor John Doe. Please review and retry."
      bannerType="error"
    />
  )
}

PaymentHistoryError.meta = {
  description: 'Payment history showing error state with error banner',
}

export const PaymentHistoryWarning: Story = () => {
  return (
    <ContractorPaymentPaymentHistory
      companyId="test-company-123"
      onEvent={action('onEvent')}
      bannerMessage="Some payments are pending review"
      bannerType="warning"
    />
  )
}

PaymentHistoryWarning.meta = {
  description: 'Payment history with warning state and warning banner',
}

// ============================================================================
// CREATE PAYMENT SCREEN (Screen 1 in Figma: "Pay contractors")
// ============================================================================

export const CreatePaymentDefault: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentDefault.meta = {
  description:
    'Create payment screen with initial state - ready to enter payment date and contractor info',
}

export const CreatePaymentWithValidation: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentWithValidation.meta = {
  description: 'Create payment screen showing validation errors on form fields',
}

export const CreatePaymentLoading: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentLoading.meta = {
  description: 'Create payment screen in loading state while saving payment configuration',
}

// ============================================================================
// EDIT PAYMENT MODAL (Screen 4 in Figma: "Edit payment for Ella Fitzgerald")
// ============================================================================

export const EditPaymentFixedWage: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditPaymentFixedWage.meta = {
  description:
    'Edit modal for fixed wage contractor - shows fixed pay, bonus, reimbursements, and payment method selection',
}

export const EditPaymentHourlyWage: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractorHourly}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditPaymentHourlyWage.meta = {
  description:
    'Edit modal for hourly wage contractor - shows hours field, bonus, reimbursements, and payment method',
}

export const EditPaymentWithValidation: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractorHourly}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditPaymentWithValidation.meta = {
  description: 'Edit modal displaying validation errors on numeric fields',
}

// ============================================================================
// PAYMENT OVERVIEW / DETAIL SCREEN (Screen 2 in Figma: "Payment statement")
// ============================================================================

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
    'Payment detail screen showing payment statement for a specific date with all contractors and breakdown',
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
  description: 'Payment detail screen with no payments on selected date - shows empty state',
}

export const PaymentDetailLoading: Story = () => {
  return (
    <ContractorPaymentDetail
      companyId="test-company-123"
      date="2025-09-17"
      onEvent={action('onEvent')}
    />
  )
}

PaymentDetailLoading.meta = {
  description: 'Payment detail screen in loading state while fetching payment data',
}

// ============================================================================
// REVIEW AND SUBMIT SCREEN (Screen 5 in Figma: "Review and submit")
// ============================================================================

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
    'Review and submit screen - final confirmation screen with payment summary and all contractor details',
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
  description: 'Review and submit screen showing validation errors preventing submission',
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
    'Review and submit screen with warnings but allowing user to proceed (e.g., check payment)',
}
