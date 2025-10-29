import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { OverviewPresentation } from './OverviewPresentation'

export default {
  title: 'Domain/Contractor/Payments',
} satisfies StoryDefault

export const ReviewAndSubmitDefault: Story = () => {
  const mockPaymentSummary = {
    totalAmount: '1180',
    debitAmount: '1180',
    debitAccount: 'Checking Account ending in 4567',
    debitDate: '2025-09-15',
    contractorPayDate: '2025-09-17',
    checkDate: '2025-09-17',
    submitByDate: '2025-09-14',
  }

  const mockContractorPaymentGroup = {
    uuid: 'group-1',
    companyUuid: 'company-1',
    checkDate: '2025-09-17',
    debitDate: '2025-09-15',
    status: 'Unfunded' as const,
    totals: {
      amount: '1180',
      debitAmount: '1180',
      wageAmount: '1000',
      reimbursementAmount: '0',
    },
    contractorPayments: [
      {
        uuid: '1',
        contractorUuid: 'armstrong-louis',
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
        contractorUuid: 'fitzgerald-ella',
        wageType: 'Hourly' as const,
        hourlyRate: '18',
        paymentMethod: 'Direct Deposit' as const,
        hours: '10',
        wage: undefined,
        bonus: '0',
        reimbursement: '0',
        wageTotal: '180',
      },
    ],
  }

  return (
    <OverviewPresentation
      paymentSummary={mockPaymentSummary}
      contractorPaymentGroup={mockContractorPaymentGroup}
      onEdit={action('onEdit')}
      onSubmit={action('onSubmit')}
    />
  )
}

ReviewAndSubmitDefault.meta = {
  description:
    'Payment Summary page - final confirmation with payment summary details and all contractor payment information ready for submission',
}
