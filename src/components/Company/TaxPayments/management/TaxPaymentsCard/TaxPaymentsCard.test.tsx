import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { TaxPaymentsCard } from './TaxPaymentsCard'
import { server } from '@/test/mocks/server'
import { handleGetTaxPayments } from '@/test/mocks/apis/tax_payments'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { addDays, formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Fixture dates are relative to the run date so they never expire: the card
 * classifies payments by comparing their due date to today, so a hardcoded date
 * would silently flip from upcoming to overdue.
 */
const daysFromToday = (days: number) => formatDateToStringDate(addDays(new Date(), days)) ?? ''

const baseTaxPayment = {
  company_uuid: 'company-123',
  period_start: daysFromToday(-60),
  period_end: daysFromToday(-31),
  payment_sent_on: null,
  amount_paid: '0.00',
}

const overdueFederalPayment = {
  ...baseTaxPayment,
  uuid: 'tax-payment-overdue-federal',
  agency_name: 'Internal Revenue Service',
  jurisdiction: 'US',
  due_date: daysFromToday(-20),
  amount: '1000.00',
}

const overdueStatePayment = {
  ...baseTaxPayment,
  uuid: 'tax-payment-overdue-state',
  agency_name: 'Employment Development Department',
  jurisdiction: 'CA',
  due_date: daysFromToday(-5),
  amount: '240.00',
}

const upcomingFederalPayment = {
  ...baseTaxPayment,
  uuid: 'tax-payment-upcoming-federal',
  agency_name: 'Internal Revenue Service',
  jurisdiction: 'US',
  due_date: daysFromToday(10),
  amount: '14661.36',
}

const upcomingStatePayment = {
  ...baseTaxPayment,
  uuid: 'tax-payment-upcoming-state',
  agency_name: 'Employment Development Department',
  jurisdiction: 'CA',
  due_date: daysFromToday(21),
  amount: '1536.67',
}

/** A payment that owes nothing, which the card must read as settled rather than upcoming. */
const upcomingZeroAmountPayment = {
  ...baseTaxPayment,
  uuid: 'tax-payment-upcoming-zero',
  agency_name: 'Franchise Tax Board',
  jurisdiction: 'CA',
  due_date: daysFromToday(3),
  amount: '0.00',
}

/** An unsettled refund: money owed *to* the company, never a payment it owes. */
const upcomingRefund = {
  ...baseTaxPayment,
  uuid: 'tax-payment-upcoming-refund',
  agency_name: 'Internal Revenue Service',
  jurisdiction: 'US',
  due_date: daysFromToday(2),
  amount: '-42.00',
}

/**
 * Serves each of the card's two date-bounded windows its own fixture list. The
 * card asks for past-due payments with `due_date_to` and upcoming ones with
 * `due_date_from`, so the bound present on the request identifies the window.
 */
function serveWindows({
  pastDue,
  upcoming,
}: {
  pastDue: Record<string, unknown>[]
  upcoming: Record<string, unknown>[]
}) {
  const resolver = vi.fn<HttpResponseResolver>(({ request }) => {
    const isUpcomingWindow = new URL(request.url).searchParams.has('due_date_from')
    return HttpResponse.json(isUpcomingWindow ? upcoming : pastDue)
  })
  server.use(handleGetTaxPayments(resolver))
  return resolver
}

const unstableFeatures = { companySettingsDashboard: true }

describe('TaxPaymentsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the SDK error card instead of the card without the companySettingsDashboard flag', async () => {
    // The flag check throws; GustoProvider's top-level ErrorBoundary catches it
    // and renders InternalError in place of the card.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage tax payments' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('reports how much is overdue and names the next payment still owing', async () => {
    serveWindows({
      pastDue: [overdueStatePayment, overdueFederalPayment],
      upcoming: [upcomingFederalPayment, upcomingStatePayment],
    })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage tax payments' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Tax payments' })).toBeInTheDocument()
    expect(await screen.findByText('2 payments overdue')).toBeInTheDocument()
    expect(screen.getByText('$1,240.00')).toBeInTheDocument()

    // Only the soonest upcoming payment is named, so the later state payment's
    // agency and amount stay off the card.
    expect(screen.getByText('Next payment due')).toBeInTheDocument()
    expect(screen.getByText('Internal Revenue Service')).toBeInTheDocument()
    expect(screen.getByText('Federal')).toBeInTheDocument()
    expect(screen.getByText('$14,661.36')).toBeInTheDocument()
  })

  it('skips settled payments and refunds when picking the next one due', async () => {
    serveWindows({
      pastDue: [],
      upcoming: [upcomingZeroAmountPayment, upcomingRefund, upcomingStatePayment],
    })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    expect(await screen.findByText('None overdue')).toBeInTheDocument()
    expect(screen.getByText('Employment Development Department')).toBeInTheDocument()
    expect(screen.getByText('CA')).toBeInTheDocument()
    expect(screen.getByText('$1,536.67')).toBeInTheDocument()
  })

  it('renders the empty state when nothing is outstanding', async () => {
    serveWindows({ pastDue: [], upcoming: [] })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    expect(await screen.findByText('No tax payments scheduled')).toBeInTheDocument()
  })

  it('renders the empty state when the only upcoming payment is a refund', async () => {
    serveWindows({ pastDue: [], upcoming: [upcomingRefund] })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    // A refund is outstanding but owes nothing, so the company has no payment due
    // and the card must say so rather than reporting the refund's negative amount.
    expect(await screen.findByText('No tax payments scheduled')).toBeInTheDocument()
  })

  it('replaces the summary with an error rather than reporting nothing is owed', async () => {
    server.use(handleGetTaxPayments(() => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    expect(
      await screen.findByText('Could not load tax payments, try again later.'),
    ).toBeInTheDocument()
    // A failed read is not evidence that the company owes nothing, so neither
    // positive claim may appear beneath the error.
    expect(screen.queryByText('None overdue')).toBeNull()
    expect(screen.queryByText('No tax payments scheduled')).toBeNull()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    serveWindows({ pastDue: [overdueFederalPayment], upcoming: [upcomingFederalPayment] })
    const user = userEvent.setup()

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage tax payments' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage tax payments' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_TAX_PAYMENTS_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })
})
