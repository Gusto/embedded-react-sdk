import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import { PaymentHistoryPresentation } from './PaymentHistoryPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildContractorIndividual } from '@/test/factories/contractor'
import { getCellByColumnHeader } from '@/test-utils/tableQueries'

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
// True total = 260. Bonus is already inside wageTotal, so it must not be added again.
const paymentGroup: ContractorPaymentGroup = {
  uuid: 'payment-group-1',
  checkDate: '2026-07-15',
  debitDate: '2026-07-15',
  totals: { amount: '260.00' },
  contractorPayments: [
    {
      uuid: 'payment-1',
      contractorUuid: 'contractor-1',
      wageType: 'Hourly',
      hourlyRate: '18.00',
      paymentMethod: 'Direct Deposit',
      hours: '10',
      bonus: '50',
      reimbursement: '30',
      wageTotal: '230.00',
      mayCancel: false,
    },
  ],
}

const renderScreen = () =>
  renderWithProviders(
    <PaymentHistoryPresentation
      paymentGroup={paymentGroup}
      contractors={contractors}
      onViewPayment={vi.fn()}
      onCancelPayment={vi.fn()}
      isCancelling={false}
    />,
  )

describe('PaymentHistoryPresentation', () => {
  it('shows the total as wageTotal + reimbursement, without double-counting bonus', async () => {
    renderScreen()

    const table = await screen.findByTestId('data-table')
    const row = await within(table).findByRole('row', { name: 'Contractor Test' })
    expect(getCellByColumnHeader(table, row, 'Total')).toHaveTextContent('$260.00')
  })
})
