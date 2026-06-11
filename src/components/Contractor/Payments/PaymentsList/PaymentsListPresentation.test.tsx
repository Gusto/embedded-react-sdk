import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { PaymentsListPresentation } from './PaymentsListPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  numberOfMonths: 3,
  contractorPayments: [],
  onCreatePayment: vi.fn(),
  onDateRangeChange: vi.fn(),
  onViewPayment: vi.fn(),
  companyId: 'company-123',
  hasUnresolvedWireInRequests: false,
  onEvent: vi.fn(),
}

describe('PaymentsListPresentation', () => {
  it('shows create payment actions by default', async () => {
    renderWithProviders(<PaymentsListPresentation {...defaultProps} />)

    await screen.findByRole('heading', { name: 'Contractor payments' })
    expect(screen.getAllByRole('button', { name: 'Create payment' }).length).toBeGreaterThan(0)
  })

  it('hides create payment actions in read-only mode', async () => {
    renderWithProviders(<PaymentsListPresentation {...defaultProps} />, { readOnly: true })

    await screen.findByRole('heading', { name: 'Contractor payments' })
    expect(screen.queryByRole('button', { name: 'Create payment' })).not.toBeInTheDocument()
  })
})
