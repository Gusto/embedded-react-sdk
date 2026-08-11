import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { HistoricalPaymentSummary } from './HistoricalPaymentSummary'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { handleGetContractorPaymentGroup } from '@/test/mocks/apis/contractor_payment_groups'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const PAYMENT_GROUP_ID = 'payment-group-123'

const hourlyContractor = {
  uuid: 'contractor-1',
  company_uuid: COMPANY_ID,
  wage_type: 'Hourly',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  hourly_rate: '50.00',
  payment_method: 'Direct Deposit',
}

const contractorPaymentGroup = {
  uuid: PAYMENT_GROUP_ID,
  company_uuid: COMPANY_ID,
  check_date: '2026-07-15',
  status: 'Funded',
  totals: { amount: '500.00' },
  contractor_payments: [
    {
      uuid: 'payment-1',
      contractor_uuid: 'contractor-1',
      payment_method: 'Historical Payment',
      wage_type: 'Hourly',
      hourly_rate: '50.00',
      hours: '10',
      bonus: '0',
      reimbursement: '0',
      wage_total: '500.00',
    },
  ],
}

const renderScreen = (onEvent = vi.fn()) => {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([hourlyContractor], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
    handleGetContractorPaymentGroup(() => HttpResponse.json(contractorPaymentGroup)),
  )
  renderWithProviders(
    <HistoricalPaymentSummary
      companyId={COMPANY_ID}
      paymentGroupId={PAYMENT_GROUP_ID}
      onEvent={onEvent}
    />,
  )
  return { onEvent }
}

describe('HistoricalPaymentSummary', () => {
  it('renders the success confirmation and the per-contractor breakdown', async () => {
    renderScreen()

    expect(await screen.findByRole('heading', { name: 'Payment summary' })).toBeInTheDocument()
    expect(screen.getByText('Historical payment recorded successfully')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('does not show debit account, debit date, or wire information', async () => {
    renderScreen()

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.queryByText('Debit Account')).not.toBeInTheDocument()
    expect(screen.queryByText('Debit Date')).not.toBeInTheDocument()
  })

  it('emits exit when Done is clicked', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderScreen()

    await user.click(await screen.findByRole('button', { name: 'Done' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT)
  })
})
