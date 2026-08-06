import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { HistoricalPaymentSummary } from './HistoricalPaymentSummary'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import {
  handleCreateContractorPaymentGroup,
  handlePreviewContractorPaymentGroup,
} from '@/test/mocks/apis/contractor_payment_groups'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const CHECK_DATE = '2026-07-15'

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

const contractorPayments = [
  {
    contractorUuid: 'contractor-1',
    paymentMethod: 'Historical Payment' as const,
    hours: '10',
    bonus: '0',
    reimbursement: '0',
  },
]

const previewResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
  const requestBody = (await request.json()) as {
    check_date?: string
    contractor_payments?: Array<Record<string, unknown>>
  }
  return HttpResponse.json({
    check_date: requestBody.check_date,
    creation_token: 'preview-token-123',
    contractor_payments: requestBody.contractor_payments?.map((payment, index) => ({
      ...payment,
      uuid: `preview-payment-${index}`,
      wage_type: 'Hourly',
      hourly_rate: '50.00',
      wage_total: '500.00',
    })),
    totals: { amount: '500.00' },
  })
})

const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
  const requestBody = (await request.json()) as {
    check_date?: string
    contractor_payments?: Array<Record<string, unknown>>
  }
  return HttpResponse.json(
    {
      uuid: 'created-group-uuid',
      check_date: requestBody.check_date,
      contractor_payments: requestBody.contractor_payments?.map((payment, index) => ({
        ...payment,
        uuid: `payment-${index}`,
        wage_type: 'Hourly',
        hourly_rate: '50.00',
        wage_total: '500.00',
      })),
      totals: { amount: '500.00' },
    },
    { status: 201 },
  )
})

const renderScreen = (onEvent = vi.fn()) => {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([hourlyContractor], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
    handlePreviewContractorPaymentGroup(previewResolver),
    handleCreateContractorPaymentGroup(createResolver),
  )
  renderWithProviders(
    <HistoricalPaymentSummary
      companyId={COMPANY_ID}
      checkDate={CHECK_DATE}
      contractorPayments={contractorPayments}
      onEvent={onEvent}
    />,
  )
  return { onEvent }
}

describe('HistoricalPaymentSummary', () => {
  it('previews the entered payments and renders the review screen', async () => {
    renderScreen()

    expect(await screen.findByRole('heading', { name: 'Review and submit' })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit historical payment' })).toBeInTheDocument()
    expect(previewResolver).toHaveBeenCalledTimes(1)
  })

  it('creates the payment group on submit and shows the created summary', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderScreen()

    await user.click(await screen.findByRole('button', { name: 'Submit historical payment' }))

    await waitFor(() => {
      expect(createResolver).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByRole('heading', { name: 'Payment summary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
      expect.objectContaining({ uuid: 'created-group-uuid' }),
    )
  })

  it('emits exit when Done is clicked after creation', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderScreen()

    await user.click(await screen.findByRole('button', { name: 'Submit historical payment' }))
    await user.click(await screen.findByRole('button', { name: 'Done' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT)
  })
})
