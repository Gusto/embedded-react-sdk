import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { HistoricalPaymentFlow } from './HistoricalPaymentFlow'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import {
  handleCreateContractorPaymentGroup,
  handleGetContractorPaymentGroup,
  handlePreviewContractorPaymentGroup,
} from '@/test/mocks/apis/contractor_payment_groups'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const DATE_LABEL = 'Payment date'

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

const createdPaymentGroup = {
  uuid: 'created-group-uuid',
  company_uuid: COMPANY_ID,
  check_date: '2026-07-15',
  status: 'Funded',
  totals: { amount: '500.00' },
  contractor_payments: [
    {
      uuid: 'payment-1',
      contractor_uuid: 'contractor-1',
      payment_method: 'Historical Payment',
      wage_type: 'Hourly',
      hourly_rate: '50.00',
      hours: '10',
      bonus: '0',
      reimbursement: '0',
      wage_total: '500.00',
    },
  ],
}

const renderScreen = (onEvent = vi.fn()) => {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([hourlyContractor], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
    handlePreviewContractorPaymentGroup(() =>
      HttpResponse.json({
        check_date: '2026-07-15',
        creation_token: 'preview-token-123',
        contractor_payments: [
          {
            contractor_uuid: 'contractor-1',
            uuid: 'preview-payment-1',
            wage_type: 'Hourly',
            hourly_rate: '50.00',
            hours: '10',
            wage_total: '500.00',
          },
        ],
        totals: { amount: '500.00' },
      }),
    ),
    handleCreateContractorPaymentGroup(() =>
      HttpResponse.json(createdPaymentGroup, { status: 201 }),
    ),
    handleGetContractorPaymentGroup(() => HttpResponse.json(createdPaymentGroup)),
  )
  const { rerender } = renderWithProviders(
    <HistoricalPaymentFlow companyId={COMPANY_ID} onEvent={onEvent} />,
  )
  return { onEvent, rerender }
}

async function typeDate(
  user: ReturnType<typeof userEvent.setup>,
  { month, day, year }: { month: string; day: string; year: string },
) {
  const group = screen.getByRole('group', { name: new RegExp(DATE_LABEL, 'i') })
  await user.type(within(group).getByRole('spinbutton', { name: /^month/i }), month)
  await user.type(within(group).getByRole('spinbutton', { name: /^day/i }), day)
  await user.type(within(group).getByRole('spinbutton', { name: /^year/i }), year)
}

const walkToSummary = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => {
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })
  await typeDate(user, { month: '07', day: '15', year: '2026' })
  const checkboxes = screen.getAllByRole('checkbox')
  await user.click(checkboxes[1] as Element)
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Continue' }))

  await screen.findByRole('heading', { name: 'Enter payment amounts' })
  await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))
  await user.type(screen.getByLabelText('Hours'), '10')
  await user.click(screen.getByRole('button', { name: 'Done' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Continue' }))

  await screen.findByRole('heading', { name: 'Review and submit' })
  await user.click(screen.getByRole('button', { name: 'Submit historical payment' }))
}

describe('HistoricalPaymentFlow', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-07-27T12:00:00-07:00'))
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('chains CreateHistoricalPayment into HistoricalPaymentSummary, carrying the created payment group id', async () => {
    const { onEvent } = renderScreen()

    await walkToSummary(user)

    expect(await screen.findByRole('heading', { name: 'Payment summary' })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
      expect.objectContaining({ uuid: 'created-group-uuid' }),
    )
  })

  it('emits exit when Done is clicked on the summary', async () => {
    const { onEvent } = renderScreen()

    await walkToSummary(user)
    await user.click(await screen.findByRole('button', { name: 'Done' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT,
      undefined,
    )
  })

  it('resets to the first screen when companyId changes', async () => {
    server.use(
      handleGetContractorsList(() =>
        HttpResponse.json([hourlyContractor], {
          headers: { 'x-total-pages': '1', 'x-total-count': '1' },
        }),
      ),
    )
    const { rerender } = renderWithProviders(
      <HistoricalPaymentFlow companyId={COMPANY_ID} onEvent={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await typeDate(user, { month: '07', day: '15', year: '2026' })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Enter payment amounts' })

    rerender(<HistoricalPaymentFlow companyId="company-456" onEvent={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Enter payment amounts' })).not.toBeInTheDocument()
  })

  it('preserves in-flight state across a re-render that only carries a new onEvent reference', async () => {
    const { rerender } = renderScreen()

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await typeDate(user, { month: '07', day: '15', year: '2026' })
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Enter payment amounts' })

    rerender(<HistoricalPaymentFlow companyId={COMPANY_ID} onEvent={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Enter payment amounts' })).toBeInTheDocument()
  })
})
