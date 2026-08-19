import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { ContractorPaymentGroupPreview } from '@gusto/embedded-api/models/components/contractorpaymentgrouppreview'
import { PreviewPresentation } from './PreviewPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildContractorIndividual } from '@/test/factories/contractor'
import { getCellByColumnHeader } from '@/test-utils/tableQueries'
import { assertDefined } from '@/test-utils/assertions'

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
  it('shows the group total, the row total, and the footer total as wageTotal + reimbursement', async () => {
    renderScreen()

    const summaryTable = await screen.findByRole('grid', { name: 'Payment Summary' })
    const contractorPaymentsTable = screen.getByRole('grid', { name: 'What your company pays' })

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
