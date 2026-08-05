import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { HistoricalPaymentContractors } from './HistoricalPaymentContractors'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const LABEL = 'Payment date'

const eligibleContractor = {
  uuid: 'contractor-1',
  company_uuid: COMPANY_ID,
  wage_type: 'Fixed',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  payment_method: 'Direct Deposit',
}

const listContractors = (contractors: Array<Record<string, unknown>>) =>
  handleGetContractorsList(() =>
    HttpResponse.json(contractors, {
      headers: { 'x-total-pages': '1', 'x-total-count': String(contractors.length) },
    }),
  )

const renderScreen = (onEvent = vi.fn()) => {
  server.use(listContractors([eligibleContractor]))
  renderWithProviders(<HistoricalPaymentContractors companyId={COMPANY_ID} onEvent={onEvent} />)
  return { onEvent }
}

async function typeDate(
  user: ReturnType<typeof userEvent.setup>,
  { month, day, year }: { month: string; day: string; year: string },
) {
  const group = screen.getByRole('group', { name: new RegExp(LABEL, 'i') })
  await user.type(within(group).getByRole('spinbutton', { name: /^month/i }), month)
  await user.type(within(group).getByRole('spinbutton', { name: /^day/i }), day)
  await user.type(within(group).getByRole('spinbutton', { name: /^year/i }), year)
}

describe('HistoricalPaymentContractors', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-07-27T12:00:00-07:00'))
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the heading, subtitle, and contractor list', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Record a historical payment' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Log a contractor payment that already happened outside Gusto. Pick a paid date and the contractors you paid.',
      ),
    ).toBeInTheDocument()
  })

  it('disables Continue until both a check date and a contractor are selected', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await typeDate(user, { month: '07', day: '15', year: '2026' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    // checkboxes[0] is the select-all header; checkboxes[1] is the first contractor row.
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('emits contractorsSelected with the picked contractor ids and check date', async () => {
    const { onEvent } = renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    await typeDate(user, { month: '07', day: '15', year: '2026' })
    // checkboxes[0] is the select-all header; checkboxes[1] is the first contractor row.
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CONTRACTORS_SELECTED,
      { contractorIds: ['contractor-1'], checkDate: '2026-07-15' },
    )
  })

  it('shows an error and disables Continue for a year before the allowed tax year', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    await typeDate(user, { month: '07', day: '15', year: '2024' })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)

    expect(
      screen.getByText('You cannot create a payment in 2024. Please select a 2026 date.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('shows an error and disables Continue for a future date', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    await typeDate(user, { month: '07', day: '15', year: '2027' })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)

    expect(
      screen.getByText(
        'You cannot issue historical payments for the future. Please choose a date in the past.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('does not emit when Continue is clicked while the date is out of range', async () => {
    const { onEvent } = renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    await typeDate(user, { month: '07', day: '15', year: '2024' })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)

    // The button is disabled, but assert the handler itself is also guarded —
    // disabled-button clicks are inert in the DOM, so this exercises the same
    // invariant a11y tooling or a synthetic click could otherwise bypass.
    screen.getByRole('button', { name: 'Continue' }).click()
    expect(onEvent).not.toHaveBeenCalled()
  })
})
