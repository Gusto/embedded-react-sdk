import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentEditModal } from './EditModal'

const mockContractorFixed = {
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
  title: 'Domain/ContractorPayment/Individual Contractor Earnings',
} satisfies StoryDefault

export const EditPaymentFixedWage: Story = () => {
  return (
    <ContractorPaymentEditModal
      contractor={mockContractorFixed}
      onSave={action('onSave')}
      onCancel={action('onCancel')}
    />
  )
}

EditPaymentFixedWage.meta = {
  description:
    'Edit modal for fixed wage contractor - allows editing fixed pay, bonus, reimbursements, and payment method',
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
    'Edit modal for hourly wage contractor - allows editing hours, bonus, reimbursements, and payment method',
}
