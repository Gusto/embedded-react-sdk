import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import { PreviewPresentation } from './PreviewPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildContractorIndividual } from '@/test/factories/contractor'

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
// True total = 260. This preview (pre-submission) totals must match the post-creation totals for
// the same payment.
const contractorPaymentGroup: ContractorPaymentGroupPreview = {
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
      bonus: '50',
      reimbursement: '30',
      wageTotal: '230.00',
    },
  ],
}

const renderScreen = () =>
  renderWithProviders(
    <PreviewPresentation
      contractorPaymentGroup={contractorPaymentGroup}
      contractors={contractors}
      onBackToEdit={vi.fn()}
      onSubmit={vi.fn()}
      isLoading={false}
    />,
  )

describe('PreviewPresentation', () => {
  it('shows the row and footer total as wageTotal + reimbursement', async () => {
    renderScreen()

    // Appears three times: the group's own totals.amount, the contractor's row, and the footer.
    expect(await screen.findAllByText('$260.00')).toHaveLength(3)
  })
})
