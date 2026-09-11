import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PayrollList } from './PayrollList'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const sharedHandlers = [
  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/wire_in_requests`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_periods`, () => {
    return HttpResponse.json([])
  }),
]

describe('PayrollList', () => {
  const defaultProps = {
    companyId: 'company-123',
    onEvent: vi.fn(),
  }

  let capturedPayrollListUrl: URL | null = null

  beforeEach(() => {
    capturedPayrollListUrl = null

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, ({ request }) => {
        capturedPayrollListUrl = new URL(request.url)
        return HttpResponse.json([])
      }),
      ...sharedHandlers,
    )
  })

  it('includes off-cycle payrolls with a wide date window', async () => {
    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(capturedPayrollListUrl).not.toBeNull()
    })

    expect(capturedPayrollListUrl!.searchParams.get('include_off_cycle')).toBe('true')

    const endDateParam = capturedPayrollListUrl!.searchParams.get('end_date')
    expect(endDateParam).toBeTruthy()

    const endDate = new Date(endDateParam!)
    const twoMonthsFromNow = new Date()
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    expect(endDate.getTime()).toBeGreaterThan(twoMonthsFromNow.getTime())
  })

  it('renders the date filter trigger button', async () => {
    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Filter by date' })).toBeInTheDocument()
    })
  })

  it('passes a default start_date of today to the API', async () => {
    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(capturedPayrollListUrl).not.toBeNull()
    })

    const startDateParam = capturedPayrollListUrl!.searchParams.get('start_date')
    expect(startDateParam).toBeTruthy()

    const startDate = new Date(startDateParam!)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(startDate.getTime()).toBeGreaterThan(yesterday.getTime())
    expect(startDate.getTime()).toBeLessThan(tomorrow.getTime())
  })

  it('includes page and per params in the API request', async () => {
    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(capturedPayrollListUrl).not.toBeNull()
    })

    expect(capturedPayrollListUrl!.searchParams.get('page')).toBeTruthy()
    expect(capturedPayrollListUrl!.searchParams.get('per')).toBeTruthy()
  })

  describe('transition payroll blocker', () => {
    const regularPayroll = {
      payroll_uuid: 'payroll-regular-1',
      processed: false,
      off_cycle: false,
      payroll_type: 'Regular',
      check_date: '2025-01-15',
      payroll_deadline: '2025-01-14T23:30:00Z',
      pay_period: {
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        pay_schedule_uuid: 'schedule-1',
      },
    }

    const transitionPayPeriod = {
      start_date: '2025-01-16',
      end_date: '2025-01-31',
      pay_schedule_uuid: 'schedule-1',
      payroll: { processed: false, payroll_type: 'transition' },
    }

    it('disables Run Payroll on regular rows when an unprocessed transition exists', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () =>
          HttpResponse.json([regularPayroll]),
        ),
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
          HttpResponse.json([]),
        ),
        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () =>
          HttpResponse.json([]),
        ),
        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/wire_in_requests`, () =>
          HttpResponse.json([]),
        ),
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_periods`, () =>
          HttpResponse.json([transitionPayPeriod]),
        ),
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      const runPayrollButton = await screen.findByRole('button', { name: 'Run Payroll' })
      expect(runPayrollButton).toBeDisabled()
    })

    it('does not disable Run Payroll when there are no unprocessed transitions', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () =>
          HttpResponse.json([regularPayroll]),
        ),
        ...sharedHandlers,
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      const runPayrollButton = await screen.findByRole('button', { name: 'Run Payroll' })
      expect(runPayrollButton).not.toBeDisabled()
    })
  })

  it('renders pagination controls when totalCount exceeds page size', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, ({ request }) => {
        capturedPayrollListUrl = new URL(request.url)
        return HttpResponse.json([], {
          headers: {
            'x-total-pages': '3',
            'x-total-count': '15',
          },
        })
      }),
      ...sharedHandlers,
    )

    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })
  })

  it('keeps the current page visible and marks the grid busy instead of re-suspending while the next page loads', async () => {
    const user = userEvent.setup()
    const regularPayroll = {
      payroll_uuid: 'payroll-page-1',
      processed: false,
      off_cycle: false,
      payroll_type: 'Regular',
      check_date: '2025-01-15',
      payroll_deadline: '2025-01-14T23:30:00Z',
      pay_period: {
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        pay_schedule_uuid: 'schedule-1',
      },
    }

    let resolveSecondPage: (() => void) | undefined
    const payrollsResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      const url = new URL(request.url)
      const headers = { 'x-total-pages': '2', 'x-total-count': '10' }

      if (url.searchParams.get('page') === '2') {
        await new Promise<void>(resolve => {
          resolveSecondPage = resolve
        })
        return HttpResponse.json([], { headers })
      }

      return HttpResponse.json([regularPayroll], { headers })
    })
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, payrollsResolver),
      ...sharedHandlers,
    )

    renderWithProviders(<PayrollList {...defaultProps} />)

    const runPayrollButton = await screen.findByRole('button', { name: 'Run Payroll' })

    await user.click(screen.getByTestId('pagination-next'))

    // The page-2 request is still pending (held open above). The previous page's row and
    // chrome stay in place instead of the whole component re-suspending to the SDK's
    // full-page loading skeleton.
    expect(runPayrollButton).toBeInTheDocument()
    expect(
      document.querySelectorAll(
        '[role="status"][aria-busy="true"][aria-label="Loading component..."]',
      ),
    ).toHaveLength(0)
    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Fetching data...' })).toBeInTheDocument()
    })
    expect(payrollsResolver).toHaveBeenCalledTimes(2)

    resolveSecondPage?.()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Run Payroll' })).not.toBeInTheDocument()
    })
  })
})
