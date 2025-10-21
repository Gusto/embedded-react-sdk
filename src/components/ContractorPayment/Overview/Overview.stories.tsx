import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { OverviewPresentation } from './OverviewPresentation'

export default {
  title: 'Domain/ContractorPayment/Payment Summary',
} satisfies StoryDefault

export const ReviewAndSubmitDefault: Story = () => {
  const mockPaymentSummary = {
    totalAmount: 1180,
    debitAmount: 1180,
    debitAccount: 'Checking Account ending in 4567',
    debitDate: '2025-09-15',
    contractorPayDate: '2025-09-17',
    checkDate: '2025-09-17',
    submitByDate: '2025-09-14',
  }

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
    <OverviewPresentation
      paymentSummary={mockPaymentSummary}
      contractors={mockContractors}
      onEdit={action('onEdit')}
      onSubmit={action('onSubmit')}
    />
  )
}

ReviewAndSubmitDefault.meta = {
  description:
    'Payment Summary page - final confirmation with payment summary details and all contractor payment information ready for submission',
}
