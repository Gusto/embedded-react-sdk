import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { CreateHistoricalPayment } from './CreateHistoricalPayment'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import {
  handleCreateContractorPaymentGroup,
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

const ineligibleContractor = {
  uuid: 'contractor-2',
  company_uuid: COMPANY_ID,
  wage_type: 'Fixed',
  type: 'Individual',
  first_name: 'Grace',
  last_name: 'Hopper',
  is_active: false,
  onboarding_status: 'onboarding_completed',
  payment_method: 'Check',
}

let previewRequestBody: { contractor_payments?: Array<Record<string, unknown>> } | null = null
let createRequestBody: { creation_token?: string } | null = null

const previewResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
  const requestBody = (await request.json()) as {
    check_date?: string
    contractor_payments?: Array<Record<string, unknown>>
  }
  previewRequestBody = requestBody
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
    creation_token?: string
    contractor_payments?: Array<Record<string, unknown>>
  }
  createRequestBody = requestBody
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

const listContractors = (contractors: Array<Record<string, unknown>>) =>
  handleGetContractorsList(() =>
    HttpResponse.json(contractors, {
      headers: { 'x-total-pages': '1', 'x-total-count': String(contractors.length) },
    }),
  )

const renderScreen = (contractors: Array<Record<string, unknown>>, onEvent = vi.fn()) => {
  server.use(
    listContractors(contractors),
    handlePreviewContractorPaymentGroup(previewResolver),
    handleCreateContractorPaymentGroup(createResolver),
  )
  renderWithProviders(<CreateHistoricalPayment companyId={COMPANY_ID} onEvent={onEvent} />, {
    unstableFeatures: { historicalPayments: true },
  })
  return { onEvent }
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

const selectContractorAndContinue = async (user: ReturnType<typeof userEvent.setup>) => {
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

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Enter payment amounts' })).toBeInTheDocument()
  })
}

const enterHoursAndContinue = async (user: ReturnType<typeof userEvent.setup>) => {
  await selectContractorAndContinue(user)
  await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
  await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))
  await user.type(screen.getByLabelText('Hours'), '10')
  await user.click(screen.getByRole('button', { name: 'Done' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Continue' }))
}

describe('CreateHistoricalPayment', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-07-27T12:00:00-07:00'))
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the heading, subtitle, and only eligible contractors to select from', async () => {
    renderScreen([hourlyContractor, ineligibleContractor])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Record a historical payment' })).toBeInTheDocument()
  })

  it('renders the default empty state when there are no eligible contractors', async () => {
    renderScreen([ineligibleContractor])

    await waitFor(() => {
      expect(screen.getByText('No eligible contractors found.')).toBeInTheDocument()
    })
  })

  it('disables Continue until a valid date and at least one contractor are selected', async () => {
    renderScreen([hourlyContractor])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await typeDate(user, { month: '07', day: '15', year: '2026' })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1] as Element)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
  })

  it('shows an error and disables Continue for a year before the allowed tax year', async () => {
    renderScreen([hourlyContractor])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await typeDate(user, { month: '07', day: '15', year: '2024' })

    expect(
      screen.getByText('You cannot create a payment in 2024. Please select a 2026 date.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('shows an error and disables Continue for a future date', async () => {
    renderScreen([hourlyContractor])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await typeDate(user, { month: '07', day: '15', year: '2027' })

    expect(
      screen.getByText(
        'You cannot issue historical payments for the future. Please choose a date in the past.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('moves only the selected contractor into the amounts step', async () => {
    renderScreen([hourlyContractor, ineligibleContractor])

    await selectContractorAndContinue(user)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
  })

  it('disables amounts Continue until a payment total greater than zero is set', async () => {
    renderScreen([hourlyContractor])

    await selectContractorAndContinue(user)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))
    await user.type(screen.getByLabelText('Hours'), '10')
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
  })

  it('hides the payment method picker in the edit modal', async () => {
    renderScreen([hourlyContractor])

    await selectContractorAndContinue(user)
    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Hours')).toBeInTheDocument()
    })
    expect(screen.queryByText('Payment Method')).not.toBeInTheDocument()
  })

  it('previews the touched contractor payments in place when Continue is clicked', async () => {
    renderScreen([hourlyContractor])

    await enterHoursAndContinue(user)

    expect(await screen.findByRole('heading', { name: 'Review and submit' })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(previewResolver).toHaveBeenCalledTimes(1)
    expect(previewRequestBody?.contractor_payments).toEqual([
      expect.objectContaining({ contractor_uuid: 'contractor-1', hours: '10' }),
    ])
  })

  it('emits preview with the preview response when Continue is clicked', async () => {
    const { onEvent } = renderScreen([hourlyContractor])

    await enterHoursAndContinue(user)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_PREVIEW,
        expect.objectContaining({ creationToken: 'preview-token-123' }),
      )
    })
  })

  it('emits edit when the edit modal opens and update with the form values when saved', async () => {
    const { onEvent } = renderScreen([hourlyContractor])

    await selectContractorAndContinue(user)
    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EDIT)

    await user.type(screen.getByLabelText('Hours'), '10')
    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_UPDATE,
      expect.objectContaining({ contractorUuid: 'contractor-1', hours: 10 }),
    )
  })

  it('returns to the amounts grid without losing entered amounts when Back is clicked', async () => {
    const { onEvent } = renderScreen([hourlyContractor])

    await enterHoursAndContinue(user)
    await user.click(await screen.findByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: 'Enter payment amounts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_BACK_TO_EDIT)
  })

  it('returns to contractor selection without losing the selected date or contractors when Back is clicked on the amounts screen', async () => {
    renderScreen([hourlyContractor])

    await selectContractorAndContinue(user)
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByRole('heading', { name: 'Record a historical payment' })).toBeInTheDocument()
    const group = screen.getByRole('group', { name: new RegExp(DATE_LABEL, 'i') })
    expect(within(group).getByRole('spinbutton', { name: /^month/i })).toHaveValue(7)
    expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
  })

  it('preserves entered amounts when returning to the amounts screen after Back to contractor selection', async () => {
    renderScreen([hourlyContractor])

    await selectContractorAndContinue(user)
    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))
    await user.type(screen.getByLabelText('Hours'), '10')
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await screen.findByRole('heading', { name: 'Enter payment amounts' })
    expect(screen.getByRole('row', { name: /Ada Lovelace/ })).toHaveTextContent('10.0')
  })

  it('creates the payment group on submit and emits created with the payment group response', async () => {
    const { onEvent } = renderScreen([hourlyContractor])

    await enterHoursAndContinue(user)
    await user.click(await screen.findByRole('button', { name: 'Submit historical payment' }))

    await waitFor(() => {
      expect(createResolver).toHaveBeenCalledTimes(1)
    })
    expect(createRequestBody?.creation_token).toBe('preview-token-123')

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
      expect.objectContaining({ uuid: 'created-group-uuid' }),
    )
  })

  it('replaces the Back and Submit buttons with a success message after submission', async () => {
    renderScreen([hourlyContractor])

    await enterHoursAndContinue(user)
    await user.click(await screen.findByRole('button', { name: 'Submit historical payment' }))

    await waitFor(() => {
      expect(screen.getByText('Historical payment recorded successfully')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Submit historical payment' }),
    ).not.toBeInTheDocument()
  })
})
