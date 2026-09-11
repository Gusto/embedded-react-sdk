import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { PaymentHistory } from './PaymentHistory'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { handleGetContractorPaymentGroup } from '@/test/mocks/apis/contractor_payment_groups'

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
  debit_date: '2026-07-15',
  status: 'Funded',
  contractor_payments: [
    {
      uuid: 'payment-1',
      contractor_uuid: 'contractor-1',
      payment_method: 'Direct Deposit',
      wage_type: 'Hourly',
      hourly_rate: '50.00',
      hours: '10',
      bonus: '0',
      reimbursement: '0',
      wage_total: '500.00',
      may_cancel: false,
    },
  ],
}

const renderScreen = (onEvent = vi.fn(), className?: string) => {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([hourlyContractor], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
    handleGetContractorPaymentGroup(() => HttpResponse.json(contractorPaymentGroup)),
  )
  const { container } = renderWithProviders(
    <PaymentHistory paymentId={PAYMENT_GROUP_ID} onEvent={onEvent} className={className} />,
  )
  return { onEvent, container }
}

describe('PaymentHistory', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders the payment history for the payment group', async () => {
    renderScreen()

    expect(
      await screen.findByRole('heading', { name: 'Contractor payment history' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const { container } = renderScreen(vi.fn(), 'custom-class')

    await screen.findByText('Ada Lovelace')
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
