import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { OverviewPresentation } from './OverviewPresentation'

export default {
  title: 'Domain/ContractorPayment/Payment Summary',
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
    company_uuid: 'company-1',
    check_date: '2025-09-17',
    debit_date: '2025-09-15',
    status: 'Unfunded' as const,
    totals: {
      amount: '1180',
      debit_amount: '1180',
      wage_amount: '1000',
      reimbursement_amount: '0',
    },
    contractor_payments: [
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
