import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'

export default {
  title: 'Domain/ContractorPayment/Hours and Earnings',
} satisfies StoryDefault

export const CreatePaymentDefault: Story = () => {
  const mockContractors = [
    {
      id: '1',
      name: 'Armstrong, Louis',
      wageType: 'Fixed' as const,
      paymentMethod: 'Direct Deposit' as const,
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      total: 1000,
    },
    {
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
    },
  ]

  return (
    <CreatePaymentPresentation
      contractors={mockContractors}
      paymentDate="2025-09-17"
      onPaymentDateChange={action('onPaymentDateChange')}
      onBack={action('onBack')}
      onSaveAndContinue={action('onSaveAndContinue')}
      onEditContractor={action('onEditContractor')}
      editingContractor={null}
      onSaveContractor={action('onSaveContractor')}
      onCancelEdit={action('onCancelEdit')}
      totals={{
        wages: 1180,
        bonus: 0,
        reimbursement: 0,
        total: 1180,
      }}
    />
  )
}

CreatePaymentDefault.meta = {
  description:
    'Hours and Earnings page - initial state with payment date picker and contractor table ready for input',
}
