import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import type { ContractorPaymentReceipt } from '@gusto/embedded-api/models/components/contractorpaymentreceipt'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { PaymentStatementPresentation } from './PaymentStatementPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildContractorIndividual } from '@/test/factories/contractor'
import { getCellByColumnHeader } from '@/test-utils/tableQueries'

const contractor = buildContractorIndividual({
  uuid: 'contractor-1',
  wageType: 'Hourly',
  hourlyRate: '18.00',
  paymentMethod: 'Direct Deposit',
})

// Hourly contractor: $18/hr x 10hrs + $50 bonus + $30 reimbursement.
// wageTotal = hours*rate + wage + bonus = 180 + 0 + 50 = 230 (excludes reimbursement by design).
// True total = 260.
const payment: ContractorPaymentForGroup = {
  uuid: 'payment-1',
  contractorUuid: 'contractor-1',
  wageType: 'Hourly',
  hourlyRate: '18.00',
  paymentMethod: 'Direct Deposit',
  hours: '10',
  bonus: '50',
  reimbursement: '30',
  wageTotal: '230.00',
  status: 'Unfunded',
}

describe('PaymentStatementPresentation', () => {
  it('shows the top summary amount as wageTotal + reimbursement', async () => {
    renderWithProviders(
      <PaymentStatementPresentation
        payment={payment}
        contractor={contractor}
        checkDate="2026-07-15"
      />,
    )

    const table = await screen.findByTestId('data-table')
    const row = await within(table).findByRole('row', { name: 'Direct Deposit' })
    expect(getCellByColumnHeader(table, row, 'Amount')).toHaveTextContent('$260.00')
  })

  it('renders the receipt card with values sourced from the receipt payload', async () => {
    const fundedPayment: ContractorPaymentForGroup = {
      ...payment,
      status: 'Funded',
    }
    const paymentReceipt: ContractorPaymentReceipt = {
      contractorPaymentUuid: 'receipt-uuid-123',
      nameOfSender: 'Capture Inc.',
      nameOfRecipient: 'Jordan Payee',
      debitDate: new RFCDate('2026-07-10'),
      totals: { companyDebit: '260.00' },
    }

    renderWithProviders(
      <PaymentStatementPresentation
        payment={fundedPayment}
        contractor={contractor}
        paymentReceipt={paymentReceipt}
        checkDate="2026-07-15"
      />,
    )

    expect(await screen.findByText('receipt-uuid-123')).toBeInTheDocument()
    expect(screen.getByText('Capture Inc.')).toBeInTheDocument()
    expect(screen.getByText('Jordan Payee')).toBeInTheDocument()
    expect(screen.getByText('July 10, 2026')).toBeInTheDocument()
  })
})
