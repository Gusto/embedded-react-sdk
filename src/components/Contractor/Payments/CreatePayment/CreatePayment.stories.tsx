import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'

export default {
  title: 'Domain/Contractor/Payments',
} satisfies StoryDefault

export const CreatePaymentDefault: Story = () => {
  const mockContractors = [
    {
      uuid: '1',
      contractorUuid: 'contractor-uuid-1',
      contractorName: 'Louis Armstrong',
      wageType: 'Fixed' as const,
      paymentMethod: 'Direct Deposit' as const,
      hours: undefined,
      wage: '1000',
      bonus: '0',
      reimbursement: '0',
      wageTotal: '1000',
    },
    {
      uuid: '2',
      contractorUuid: 'contractor-uuid-2',
      contractorName: 'Ella Fitzgerald',
      wageType: 'Hourly' as const,
      hourlyRate: '18',
      paymentMethod: 'Direct Deposit' as const,
      hours: '10',
      wage: undefined,
      bonus: '0',
      reimbursement: '0',
      wageTotal: '180',
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
      totals={{
        amount: '1180',
        debitAmount: '1180',
        wageAmount: '1000',
        reimbursementAmount: '0',
      }}
    />
  )
}

CreatePaymentDefault.meta = {
  description:
    'Hours and Earnings page - initial state with payment date picker and contractor table ready for input',
}
