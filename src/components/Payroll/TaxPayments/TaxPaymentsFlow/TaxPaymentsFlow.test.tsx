import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { TaxPaymentsFlow } from './TaxPaymentsFlow'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { handleGetTaxPayments } from '@/test/mocks/apis/tax_payments'
import { handleGetPayrolls, handleGetPayroll } from '@/test/mocks/apis/payrolls'

const enabledFlag = { unstableFeatures: { taxPayments: true } }

const payrollListResponse = [
  {
    payroll_uuid: 'payroll-1',
    company_uuid: 'company-123',
    pay_period: { start_date: '2026-08-22', end_date: '2026-09-04' },
  },
]

describe('TaxPaymentsFlow', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2))
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetPayrolls(() => HttpResponse.json(payrollListResponse)))
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

  it('requests a single sorted page of tax payments', async () => {
    let listUrl: URL | null = null
    const listResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      listUrl = new URL(request.url)
      return HttpResponse.json([], { headers: { 'x-total-count': '0', 'x-total-pages': '1' } })
    })
    server.use(handleGetTaxPayments(listResolver))

    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    expect(await screen.findByText('No tax payments yet')).toBeInTheDocument()
    expect(listResolver).toHaveBeenCalledTimes(1)
    expect(listUrl!.searchParams.get('per')).toBe('100')
    expect(listUrl!.searchParams.get('sort_by')).toBe('due_date:desc')
    expect(listUrl!.searchParams.get('page')).toBe('1')
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
    expect(screen.getAllByText('Aug 22–Sep 4, 2026')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Back to tax payments' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.TAX_PAYMENT_BACK, undefined)
    expect(await screen.findByRole('heading', { name: 'Tax payments' })).toBeInTheDocument()
  })

  // The shared afterEach axe pass disables `heading-order` for every integration test, since an
  // embedded component legitimately starts at h2. These assert the levels within this flow are
  // still contiguous, which that blanket exemption would otherwise hide.
  it('keeps a contiguous heading order on the list', async () => {
    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    expect(await screen.findByRole('heading', { name: 'Tax payments' })).toBeInTheDocument()
    await expectNoAxeViolations(document.body, {
      isIntegrationTest: true,
      rules: { 'heading-order': { enabled: true } },
    })
  })

  it('keeps a contiguous heading order on the detail view', async () => {
    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    await user.click(
      await screen.findByRole('button', { name: 'View Internal Revenue Service tax payment' }),
    )

    expect(await screen.findByRole('heading', { name: 'Internal Revenue Service' })).toHaveProperty(
      'tagName',
      'H2',
    )
    expect(screen.getByRole('heading', { name: 'Payment details' })).toHaveProperty('tagName', 'H3')
    expect(screen.getByRole('heading', { name: 'Tax liabilities' })).toHaveProperty('tagName', 'H3')
    await expectNoAxeViolations(document.body, {
      isIntegrationTest: true,
      rules: { 'heading-order': { enabled: true } },
    })
  })

  it('resolves every liability pay period from one windowed payroll lookup', async () => {
    let payrollsUrl: URL | null = null
    const payrollsListResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      payrollsUrl = new URL(request.url)
      return HttpResponse.json(payrollListResponse)
    })
    const payrollShowResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(handleGetPayrolls(payrollsListResolver), handleGetPayroll(payrollShowResolver))

    renderWithProviders(<TaxPaymentsFlow companyId="company-123" onEvent={onEvent} />, enabledFlag)

    await user.click(
      await screen.findByRole('button', { name: 'View Internal Revenue Service tax payment' }),
    )

    expect(await screen.findByRole('heading', { name: 'Payment details' })).toBeInTheDocument()
    expect(payrollsListResolver).toHaveBeenCalledTimes(1)
    expect(payrollShowResolver).not.toHaveBeenCalled()

    // Window is the tax period (2026-09-01 – 2026-09-30) padded by 45 days on each end.
    expect(payrollsUrl!.searchParams.get('start_date')).toBe('2026-07-18')
    expect(payrollsUrl!.searchParams.get('end_date')).toBe('2026-11-14')
  })
})
