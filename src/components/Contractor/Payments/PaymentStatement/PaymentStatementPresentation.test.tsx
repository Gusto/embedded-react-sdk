import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorPaymentForGroup } from '@gusto/embedded-api/models/components/contractorpaymentforgroup'
import { PaymentStatementPresentation } from './PaymentStatementPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const contractor: Contractor = {
  uuid: 'contractor-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  type: 'Individual',
  wageType: 'Hourly',
  hourlyRate: '18.00',
  paymentMethod: 'Direct Deposit',
  isActive: true,
  onboardingStatus: 'onboarding_completed',
}

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

    expect(await screen.findByText('$260.00')).toBeInTheDocument()
  })
})
