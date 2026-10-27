import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { TransitionPayrollAlert } from './TransitionPayrollAlert'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const payPeriodsPath = `${API_BASE_URL}/v1/companies/:company_id/pay_periods`
const paySchedulesPath = `${API_BASE_URL}/v1/companies/:company_id/pay_schedules`
const skipPayrollPath = `${API_BASE_URL}/v1/companies/:company_uuid/payrolls/skip`

const paySchedulesResponse = [
  {
    uuid: 'schedule-1',
    version: 'v1',
    custom_name: 'Weekly Schedule',
    active: true,
  },
]

const transitionPayPeriod = {
  start_date: '2025-01-01',
  end_date: '2025-01-15',
  pay_schedule_uuid: 'schedule-1',
  payroll: { processed: false, payroll_type: 'transition' },
}

const firstTransitionPayPeriod = {
  start_date: '2025-01-01',
  end_date: '2025-01-15',
  pay_schedule_uuid: 'schedule-1',
  payroll: { payroll_uuid: 'transition-payroll-1', processed: false, payroll_type: 'transition' },
}

const secondTransitionPayPeriod = {
  start_date: '2025-01-16',
  end_date: '2025-01-31',
  pay_schedule_uuid: 'schedule-1',
  payroll: { payroll_uuid: 'transition-payroll-2', processed: false, payroll_type: 'transition' },
}

describe('TransitionPayrollAlert', () => {
  it('renders nothing when there are no unprocessed transition pay periods', async () => {
    let payPeriodsCalled = false
    server.use(
      http.get(payPeriodsPath, () => {
        payPeriodsCalled = true
        return HttpResponse.json([])
      }),
      http.get(paySchedulesPath, () => HttpResponse.json(paySchedulesResponse)),
    )
    const onEvent = vi.fn()

    renderWithProviders(<TransitionPayrollAlert companyId={COMPANY_ID} onEvent={onEvent} />)

    await waitFor(() => {
      expect(payPeriodsCalled).toBe(true)
    })
    expect(screen.queryByText(/Transition payroll/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onEvent).not.toHaveBeenCalledWith(componentEvents.ERROR, expect.anything())
  })

  it('renders the alert when an unprocessed transition pay period is returned', async () => {
    server.use(
      http.get(payPeriodsPath, () => HttpResponse.json([transitionPayPeriod])),
      http.get(paySchedulesPath, () => HttpResponse.json(paySchedulesResponse)),
    )
    const onEvent = vi.fn()

    renderWithProviders(<TransitionPayrollAlert companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByText(/Transition payroll -/)).toBeInTheDocument()
  })

  it('renders nothing and emits an ERROR event when a gate query fails', async () => {
    server.use(
      http.get(payPeriodsPath, () => HttpResponse.json([])),
      http.get(
        paySchedulesPath,
        () => new HttpResponse(null, { status: 500, headers: { 'content-length': '0' } }),
      ),
    )
    const onEvent = vi.fn()

    renderWithProviders(<TransitionPayrollAlert companyId={COMPANY_ID} onEvent={onEvent} />)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.ERROR, expect.anything())
    })
    expect(screen.queryByText(/Transition payroll/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  describe('with multiple transition payrolls', () => {
    const renderMultiple = (onEvent = vi.fn()) => {
      server.use(
        http.get(payPeriodsPath, () =>
          HttpResponse.json([firstTransitionPayPeriod, secondTransitionPayPeriod]),
        ),
        http.get(paySchedulesPath, () => HttpResponse.json(paySchedulesResponse)),
      )
      renderWithProviders(<TransitionPayrollAlert companyId={COMPANY_ID} onEvent={onEvent} />)
      return onEvent
    }

    it('emits the payroll ID and dates of the row whose run button was clicked', async () => {
      const user = userEvent.setup()
      const onEvent = renderMultiple()

      await screen.findByText('You have 2 transition payrolls to run or skip')
      const runButtons = screen.getAllByRole('button', { name: /run transition payroll/i })
      expect(runButtons).toHaveLength(2)

      await user.click(runButtons[1]!)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_TRANSITION_PAYROLL, {
        payrollUuid: 'transition-payroll-2',
        startDate: '2025-01-16',
        endDate: '2025-01-31',
        payScheduleUuid: 'schedule-1',
      })
    })

    it('skips the selected row and emits its payroll ID', async () => {
      const user = userEvent.setup()
      let skipBody: Record<string, unknown> | null = null
      const skipResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        skipBody = (await request.json()) as Record<string, unknown>
        return new HttpResponse(null, { status: 202 })
      })
      server.use(http.post(skipPayrollPath, skipResolver))
      const onEvent = renderMultiple()

      await screen.findByText('You have 2 transition payrolls to run or skip')
      await user.click(screen.getAllByRole('button', { name: /skip this payroll/i })[0]!)
      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: 'Skip payroll' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.TRANSITION_PAYROLL_SKIPPED, {
          payrollUuid: 'transition-payroll-1',
          startDate: '2025-01-01',
          endDate: '2025-01-15',
          payScheduleUuid: 'schedule-1',
        })
      })
      expect(skipResolver).toHaveBeenCalledTimes(1)
      expect(skipBody).toMatchObject({
        payroll_type: 'Transition from old pay schedule',
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        pay_schedule_uuid: 'schedule-1',
      })
    })
  })
})
