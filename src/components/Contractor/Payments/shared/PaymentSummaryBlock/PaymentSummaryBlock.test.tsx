import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import {
  PaymentSummaryBlock,
  type PaymentSummaryBlockDictionary,
  type PaymentSummaryBlockGroup,
} from './PaymentSummaryBlock'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const dictionary: PaymentSummaryBlockDictionary = {
  paymentSummaryTitle: 'Payment summary',
  totalAmount: 'Total amount',
  debitAmount: 'Debit amount',
  debitAccount: 'Debit account',
  debitDate: 'Debit date',
  contractorPayDate: 'Contractor pay date',
  contractorPaymentsTitle: 'Contractor payments',
  contractor: 'Contractor',
  wageType: 'Wage',
  paymentMethod: 'Payment method',
  paymentMethods: {
    directDeposit: 'Direct deposit',
    check: 'Check',
    historicalPayment: 'Historical payment',
  },
  hours: 'Hours',
  wage: 'Fixed amount',
  bonus: 'Bonus',
  reimbursement: 'Reimbursement',
  total: 'Total',
  totalsLabel: 'Totals',
  notAvailable: 'N/A',
}

const contractors: Contractor[] = [
  {
    uuid: 'contractor-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    type: 'Individual',
    wageType: 'Hourly',
    hourlyRate: '18.00',
    paymentMethod: 'Direct Deposit',
    isActive: true,
    onboardingStatus: 'onboarding_completed',
  },
]

// Hourly contractor: $18/hr x 10hrs + $50 bonus + $30 reimbursement.
// wageTotal = hours*rate + wage + bonus = 180 + 0 + 50 = 230 (excludes reimbursement by design).
// True total = 260.
const contractorPaymentGroup: PaymentSummaryBlockGroup = {
  checkDate: '2026-07-15',
  debitDate: '2026-07-15',
  totals: { amount: '260.00', debitAmount: '255.00' },
  contractorPayments: [
    {
      contractorUuid: 'contractor-1',
      wageType: 'Hourly',
      hourlyRate: '18.00',
      paymentMethod: 'Direct Deposit',
      hours: '10',
      wage: '0',
      bonus: '50',
      reimbursement: '30',
      wageTotal: '230.00',
    },
  ],
}

describe('PaymentSummaryBlock', () => {
  it('computes the hourly wage column from hours x rate rather than the raw wage field', () => {
    renderWithProviders(
      <PaymentSummaryBlock
        contractorPaymentGroup={contractorPaymentGroup}
        contractors={contractors}
        dictionary={dictionary}
      />,
    )

    // Appears twice: the contractor's row and the single-contractor footer total.
    expect(screen.getAllByText('$180.00')).toHaveLength(2)
  })

  it('includes reimbursement in the per-row and footer total', () => {
    renderWithProviders(
      <PaymentSummaryBlock
        contractorPaymentGroup={contractorPaymentGroup}
        contractors={contractors}
        dictionary={dictionary}
      />,
    )

    expect(screen.getAllByText('$260.00').length).toBeGreaterThanOrEqual(2)
  })
})
