import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentEditModal } from './EditModal'

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

const mockHourlyContractor = {
  id: '2',
  name: 'Fitzgerald, Ella',
  wageType: 'Hourly' as const,
  hourlyRate: 18,
  paymentMethod: 'Direct Deposit' as const,
  hours: 10,
  wage: 0,
  bonus: 0,
  reimbursement: 0,
  total: 180,
}

export default {
  title: 'ContractorPayment / EditModal',
} satisfies StoryDefault

export const FixedWageContractor: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

FixedWageContractor.meta = {
  description: 'Edit modal for a contractor with fixed wage',
}

export const HourlyContractor: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockHourlyContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

HourlyContractor.meta = {
  description: 'Edit modal for a contractor with hourly wage',
}

export const WithBonusAndReimbursement: Story = () => {
  const contractorWithExtras = {
    ...mockContractor,
    bonus: 500,
    reimbursement: 200,
    total: 1700,
  }

  return (
    <ContractorPaymentEditModal
      contractor={contractorWithExtras}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

WithBonusAndReimbursement.meta = {
  description: 'Edit modal for contractor with bonus and reimbursement amounts',
}

export const NormalState: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

NormalState.meta = {
  description: 'Normal edit modal state with contractor data',
}

export const WithValidationErrors: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

WithValidationErrors.meta = {
  description: 'Edit modal with validation errors displayed',
}

export const WithLoadingState: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractor}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

WithLoadingState.meta = {
  description: 'Edit modal in loading state while saving',
}
