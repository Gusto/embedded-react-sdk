import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PaymentsCard } from './PaymentsCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractorPayments } from '@/test/mocks/apis/contractor_payments'
import { componentEvents } from '@/shared/constants'

describe('PaymentsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders each payment with its date, total, method, and status', async () => {
    renderWithProviders(<PaymentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('December 15, 2025')).toBeInTheDocument()
    expect(screen.getByText('December 1, 2025')).toBeInTheDocument()

    // wage_total 750.00 + reimbursement 0.33 — reimbursement is excluded from
    // wage_total by the API and must be added back in.
    expect(screen.getByText('$750.33')).toBeInTheDocument()
    expect(screen.getByText('$1,520.11')).toBeInTheDocument()

    expect(screen.getByText('Direct Deposit')).toBeInTheDocument()
    expect(screen.getByText('Check')).toBeInTheDocument()
    expect(screen.getByText('Funded')).toBeInTheDocument()
    expect(screen.getByText('Unfunded')).toBeInTheDocument()
  })

  it('requests the contractor payments sorted most recent first', async () => {
    let requestUrl: URL | null = null
    const resolver = vi.fn<HttpResponseResolver>(({ request }) => {
      requestUrl = new URL(request.url)
      return HttpResponse.json([], { headers: { 'x-total-pages': '1', 'x-total-count': '0' } })
    })
    server.use(handleGetContractorPayments(resolver))

    renderWithProviders(<PaymentsCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('No payments yet')

    expect(resolver).toHaveBeenCalledTimes(1)
    expect(requestUrl!.pathname).toBe('/v1/contractors/contractor-123/payments')
    expect(requestUrl!.searchParams.get('sort_by')).toBe('check_date:desc')
  })

  it('shows the empty state and hides View all when there are no payments', async () => {
    server.use(
      handleGetContractorPayments(() =>
        HttpResponse.json([], { headers: { 'x-total-pages': '1', 'x-total-count': '0' } }),
      ),
    )

    renderWithProviders(<PaymentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('No payments yet')).toBeInTheDocument()
    expect(
      screen.getByText('Once you pay this contractor, payments will appear here.'),
    ).toBeInTheDocument()
  })

  it('emits the selected payment when a row action is used', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentsCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('December 15, 2025')
    const [viewDetails] = screen.getAllByRole('button', { name: 'View details' })
    await user.click(viewDetails!)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENTS_CARD_PAYMENT_SELECTED,
      expect.objectContaining({
        contractorId: 'contractor-123',
        payment: expect.objectContaining({
          uuid: 'contractor-payment-1',
          paymentMethod: 'Direct Deposit',
          status: 'Funded',
        }),
      }),
    )
  })

  it('surfaces an error when the payments request fails', async () => {
    server.use(handleGetContractorPayments(() => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<PaymentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
