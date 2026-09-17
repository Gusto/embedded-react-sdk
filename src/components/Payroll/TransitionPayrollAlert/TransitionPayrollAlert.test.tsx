import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { TransitionPayrollAlert } from './TransitionPayrollAlert'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const payPeriodsPath = `${API_BASE_URL}/v1/companies/:company_id/pay_periods`
const paySchedulesPath = `${API_BASE_URL}/v1/companies/:company_id/pay_schedules`

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
      http.get(paySchedulesPath, () => new HttpResponse(null, { status: 500 })),
    )
    const onEvent = vi.fn()

    renderWithProviders(<TransitionPayrollAlert companyId={COMPANY_ID} onEvent={onEvent} />)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.ERROR, expect.anything())
    })
    expect(screen.queryByText(/Transition payroll/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
