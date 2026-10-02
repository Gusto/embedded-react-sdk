import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { TaxPaymentsFlow } from './TaxPaymentsFlow'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { handleGetTaxPayments } from '@/test/mocks/apis/tax_payments'

const enabledFlag = { unstableFeatures: { taxPayments: true } }

describe('TaxPaymentsFlow', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2))
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () =>
        HttpResponse.json({
          payroll_uuid: 'payroll-1',
          company_uuid: 'company-123',
          pay_period: { start_date: '2026-08-22', end_date: '2026-09-04' },
        }),
      ),
    )
  })

  it('lists tax payments and flags overdue ones', async () => {
    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    expect(await screen.findByRole('heading', { name: 'Tax payments' })).toBeInTheDocument()
    expect(
      screen.getByText('1 tax payment is overdue and may require immediate attention.'),
    ).toBeInTheDocument()

    const table = within(screen.getByRole('grid', { name: 'Tax payments' }))
    expect(table.getByText('Internal Revenue Service')).toBeInTheDocument()
    expect(table.getByText('State · CA')).toBeInTheDocument()
    expect(table.getByText('Scheduled')).toBeInTheDocument()
    expect(table.getByText('Overdue')).toBeInTheDocument()
    expect(table.getByText('$14,661.36')).toBeInTheDocument()
  })

  it('filters by search query', async () => {
    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    await user.type(await screen.findByRole('searchbox'), 'internal')

    await waitFor(() => {
      expect(
        screen
          .getAllByRole('button', { name: /^View .* tax payment$/ })
          .map(button => button.getAttribute('aria-label')),
      ).toEqual(['View Internal Revenue Service tax payment'])
    })
  })

  it('shows the empty state when the company has no tax payments', async () => {
    server.use(
      handleGetTaxPayments(() =>
        HttpResponse.json([], { headers: { 'x-total-count': '0', 'x-total-pages': '0' } }),
      ),
    )

    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    expect(await screen.findByText('No tax payments yet')).toBeInTheDocument()
  })

  it('opens a payment, shows its liabilities by pay period, and returns to the list', async () => {
    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    await user.click(
      await screen.findByRole('button', { name: 'View Internal Revenue Service tax payment' }),
    )

    expect(onEvent).toHaveBeenCalledWith(componentEvents.TAX_PAYMENT_VIEW, {
      taxPaymentId: 'tax-payment-federal',
    })
    expect(await screen.findByRole('heading', { name: 'Payment details' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tax liabilities' })).toBeInTheDocument()
    expect(screen.getByText('00-000-0000-FIT-000')).toBeInTheDocument()
    expect(screen.getAllByText('Aug 22 – Sep 4, 2026')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Back to tax payments' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.TAX_PAYMENT_BACK, undefined)
    expect(await screen.findByRole('heading', { name: 'Tax payments' })).toBeInTheDocument()
  })
})
