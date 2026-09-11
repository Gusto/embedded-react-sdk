import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PaymentsList } from './PaymentsList'
import { handleGetContractorPaymentGroupsList } from '@/test/mocks/apis/contractor_payment_groups'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockPaymentGroupWithBlockers = {
  uuid: 'payment-group-page-1',
  company_uuid: '123',
  check_date: '2025-01-30',
  debit_date: '2025-01-28',
  status: 'Funded',
  creation_token: null,
  partner_owned_disbursement: false,
  submission_blockers: [],
  credit_blockers: [],
  totals: {
    amount: '1500.00',
    debit_amount: '1500.00',
    wage_amount: '1000.00',
    reimbursement_amount: '50.00',
    check_amount: '0.00',
  },
}

describe('PaymentsList', () => {
  const defaultProps = {
    companyId: 'company-123',
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders a list of contractor payments', async () => {
    server.use(
      handleGetContractorPaymentGroupsList(() =>
        HttpResponse.json([mockPaymentGroupWithBlockers], {
          headers: { 'x-total-pages': '1', 'x-total-count': '1' },
        }),
      ),
    )

    renderWithProviders(<PaymentsList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'View payment' })).toBeInTheDocument()
    })
  })

  it('keeps the current page visible and marks the grid busy instead of re-suspending while the next page loads', async () => {
    const user = userEvent.setup()
    let resolveSecondPage: (() => void) | undefined
    const paymentsResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      const url = new URL(request.url)
      const headers = { 'x-total-pages': '2', 'x-total-count': '10' }

      if (url.searchParams.get('page') === '2') {
        await new Promise<void>(resolve => {
          resolveSecondPage = resolve
        })
        return HttpResponse.json([], { headers })
      }

      return HttpResponse.json([mockPaymentGroupWithBlockers], { headers })
    })
    server.use(handleGetContractorPaymentGroupsList(paymentsResolver))

    renderWithProviders(<PaymentsList {...defaultProps} />)

    const viewPaymentButton = await screen.findByRole('button', { name: 'View payment' })

    await user.click(screen.getByTestId('pagination-next'))

    // The page-2 request is still pending (held open above). The previous page's row and
    // chrome stay in place instead of the whole component re-suspending to the SDK's
    // full-page loading skeleton.
    expect(viewPaymentButton).toBeInTheDocument()
    expect(
      document.querySelectorAll(
        '[role="status"][aria-busy="true"][aria-label="Loading component..."]',
      ),
    ).toHaveLength(0)
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Fetching data...' })).toBeInTheDocument()
    })
    expect(paymentsResolver).toHaveBeenCalledTimes(2)

    resolveSecondPage?.()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'View payment' })).not.toBeInTheDocument()
    })
  })
})
