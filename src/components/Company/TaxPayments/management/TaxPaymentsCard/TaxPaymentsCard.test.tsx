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

describe('TaxPaymentsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('reports how much is overdue and names the next payment still owing', async () => {
    serveWindows({
      pastDue: [overdueStatePayment, overdueFederalPayment],
      upcoming: [upcomingFederalPayment, upcomingStatePayment],
    })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />)

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

  it('skips settled payments when picking the next one due', async () => {
    serveWindows({
      pastDue: [],
      upcoming: [upcomingZeroAmountPayment, upcomingStatePayment],
    })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByText('None overdue')).toBeInTheDocument()
    expect(screen.getByText('Employment Development Department')).toBeInTheDocument()
    expect(screen.getByText('CA')).toBeInTheDocument()
    expect(screen.getByText('$1,536.67')).toBeInTheDocument()
  })

  it('renders the empty state when nothing is outstanding', async () => {
    serveWindows({ pastDue: [], upcoming: [] })

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByText('No tax payments scheduled')).toBeInTheDocument()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    serveWindows({ pastDue: [overdueFederalPayment], upcoming: [upcomingFederalPayment] })
    const user = userEvent.setup()

    renderWithProviders(<TaxPaymentsCard companyId="company-123" onEvent={onEvent} />)

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
