import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import {
  PaymentSummaryBlock,
  type PaymentSummaryBlockDictionary,
  type PaymentSummaryBlockGroup,
} from './PaymentSummaryBlock'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildContractorIndividual } from '@/test/factories/contractor'
import { getCellByColumnHeader } from '@/test-utils/tableQueries'
import { assertDefined } from '@/test-utils/assertions'

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

const contractors = [
  buildContractorIndividual({
    uuid: 'contractor-1',
    wageType: 'Hourly',
    hourlyRate: '18.00',
    paymentMethod: 'Direct Deposit',
  }),
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
  it('computes the hourly wage column from hours x rate rather than the raw wage field', async () => {
    renderWithProviders(
      <PaymentSummaryBlock
        contractorPaymentGroup={contractorPaymentGroup}
        contractors={contractors}
        dictionary={dictionary}
      />,
    )

    const contractorPaymentsTable = await screen.findByRole('grid', {
      name: dictionary.contractorPaymentsTitle,
    })

    const contractorRow = within(contractorPaymentsTable).getByRole('row', {
      name: 'Contractor Test',
    })
    expect(
      getCellByColumnHeader(contractorPaymentsTable, contractorRow, 'Fixed amount'),
    ).toHaveTextContent('$180.00')

    const footerRow = within(contractorPaymentsTable).getByRole('row', { name: 'Totals' })
    expect(
      getCellByColumnHeader(contractorPaymentsTable, footerRow, 'Fixed amount'),
    ).toHaveTextContent('$180.00')
  })

  it('includes reimbursement in the group total, per-row total, and footer total', async () => {
    renderWithProviders(
      <PaymentSummaryBlock
        contractorPaymentGroup={contractorPaymentGroup}
        contractors={contractors}
        dictionary={dictionary}
      />,
    )

    const summaryTable = await screen.findByRole('grid', { name: dictionary.paymentSummaryTitle })
    const contractorPaymentsTable = screen.getByRole('grid', {
      name: dictionary.contractorPaymentsTitle,
    })

    const summaryRow = within(summaryTable).getAllByRole('row')[1]
    assertDefined(summaryRow)
    expect(getCellByColumnHeader(summaryTable, summaryRow, 'Total amount')).toHaveTextContent(
      '$260.00',
    )

    const contractorRow = within(contractorPaymentsTable).getByRole('row', {
      name: 'Contractor Test',
    })
    expect(
      getCellByColumnHeader(contractorPaymentsTable, contractorRow, 'Total'),
    ).toHaveTextContent('$260.00')

    const footerRow = within(contractorPaymentsTable).getByRole('row', { name: 'Totals' })
    expect(getCellByColumnHeader(contractorPaymentsTable, footerRow, 'Total')).toHaveTextContent(
      '$260.00',
    )
  })
})
