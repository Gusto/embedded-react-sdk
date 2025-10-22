import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { CreatePaymentPresentation } from './CreatePaymentPresentation'

export default {
  title: 'Domain/ContractorPayment/Hours and Earnings',
} satisfies StoryDefault

export const CreatePaymentDefault: Story = () => {
  const mockContractors = [
    {
      uuid: '1',
      contractor_uuid: 'armstrong-louis',
      wage_type: 'Fixed' as const,
      payment_method: 'Direct Deposit' as const,
      hours: undefined,
      wage: '1000',
      bonus: '0',
      reimbursement: '0',
      wage_total: '1000',
    },
    {
      uuid: '2',
      contractor_uuid: 'fitzgerald-ella',
      wage_type: 'Hourly' as const,
      hourly_rate: '18',
      payment_method: 'Direct Deposit' as const,
      hours: '10',
      wage: undefined,
      bonus: '0',
      reimbursement: '0',
      wage_total: '180',
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
