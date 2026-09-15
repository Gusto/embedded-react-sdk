import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { PaymentStatement } from './PaymentStatement'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { handleGetContractorPaymentGroup } from '@/test/mocks/apis/contractor_payment_groups'

const COMPANY_ID = 'company-123'
const PAYMENT_GROUP_ID = 'payment-group-123'
const CONTRACTOR_UUID = 'contractor-1'

const checkContractor = {
  uuid: CONTRACTOR_UUID,
  company_uuid: COMPANY_ID,
  wage_type: 'Fixed',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  payment_method: 'Check',
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
      contractor_uuid: CONTRACTOR_UUID,
      payment_method: 'Check',
      wage_type: 'Fixed',
      wage: '500.00',
      bonus: '0',
      reimbursement: '0',
      wage_total: '500.00',
    },
  ],
}

const receiptNotFoundMock = http.get(
  `${API_BASE_URL}/v1/contractor_payments/:contractor_payment_uuid/receipt`,
  () => new HttpResponse(null, { status: 404 }),
)

const renderScreen = (className?: string) => {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([checkContractor], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
    handleGetContractorPaymentGroup(() => HttpResponse.json(contractorPaymentGroup)),
    receiptNotFoundMock,
  )
  const { container } = renderWithProviders(
    <PaymentStatement
      paymentGroupId={PAYMENT_GROUP_ID}
      contractorUuid={CONTRACTOR_UUID}
      onEvent={vi.fn()}
      className={className}
    />,
  )
  return { container }
}

describe('PaymentStatement', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders the statement for the selected contractor', async () => {
    renderScreen()

    expect(
      await screen.findByRole('heading', { name: 'Payment statement for Ada Lovelace' }),
    ).toBeInTheDocument()
  })

  it('applies custom className', async () => {
    const { container } = renderScreen('custom-class')

    await screen.findByRole('heading', { name: 'Payment statement for Ada Lovelace' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
