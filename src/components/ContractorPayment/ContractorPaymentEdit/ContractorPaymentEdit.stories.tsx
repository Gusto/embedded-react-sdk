import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentEdit } from './ContractorPaymentEditPresentation'

const mockContractorFixed = {
  uuid: '1',
  contractorUuid: 'armstrong-louis',
  wageType: 'Fixed' as const,
  paymentMethod: 'Direct Deposit' as const,
  hours: undefined,
  wage: '1000',
  bonus: '0',
  reimbursement: '0',
  wageTotal: '1000',
}

const mockContractorHourly = {
  uuid: '2',
  contractorUuid: 'fitzgerald-ella',
  wageType: 'Hourly' as const,
  hourlyRate: '18',
  paymentMethod: 'Check' as const,
  hours: '16',
  wage: undefined,
  bonus: '350',
  reimbursement: '0',
  wageTotal: '638',
}

export default {
  title: 'Domain/ContractorPayment/Individual Contractor Earnings',
} satisfies StoryDefault

export const EditPaymentFixedWage: Story = () => {
  return (
    <ContractorPaymentEdit
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
    <ContractorPaymentEdit
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
