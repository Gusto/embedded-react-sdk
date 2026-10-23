import { beforeEach, describe, expect, it, test, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PayrollList } from './PayrollList'
import {
  buildPayrollListHandlers,
  createListPayroll,
  createOffCyclePayroll,
  createPaySchedule,
  handleDeletePayroll,
  handleSkipPayroll,
} from './__fixtures__/payrollListMocks'
import { componentEvents } from '@/shared/constants'
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
      expect(screen.getByRole('button', { name: /^Filter by date,/ })).toBeInTheDocument()
    })
  })

  test('applies custom className', async () => {
    const { container } = renderWithProviders(
      <PayrollList {...defaultProps} className="custom-class" />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Filter by date,/ })).toBeInTheDocument()
    })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
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

  describe('rendering from API data', () => {
    it('renders the empty state when there are no payrolls', async () => {
      server.use(...buildPayrollListHandlers())

      renderWithProviders(<PayrollList {...defaultProps} />)

      expect(await screen.findByText('All payrolls have been processed')).toBeInTheDocument()
    })

    it('renders pay period and pay schedule name for each payroll', async () => {
      server.use(
        ...buildPayrollListHandlers({
          payrolls: [createListPayroll()],
          paySchedules: [createPaySchedule()],
        }),
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      expect(await screen.findByText('Weekly Schedule')).toBeInTheDocument()
      expect(screen.getByText(/Jan 1 - Jan 15, 2025/)).toBeInTheDocument()
    })

    it('renders mixed payroll types and statuses in one list', async () => {
      server.use(
        ...buildPayrollListHandlers({
          payrolls: [
            createListPayroll({ payroll_uuid: 'payroll-unprocessed' }),
            createListPayroll({
              payroll_uuid: 'payroll-calculated',
              calculated_at: '2025-01-10T10:00:00Z',
            }),
            createOffCyclePayroll('Bonus'),
          ],
          paySchedules: [createPaySchedule()],
        }),
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      expect(await screen.findAllByRole('button', { name: 'Run Payroll' })).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Review and submit' })).toBeInTheDocument()
      expect(screen.getByText('Bonus')).toBeInTheDocument()
      expect(screen.getAllByText('Regular')).toHaveLength(2)
    })
  })

  describe('events', () => {
    const payPeriod = {
      startDate: '2025-01-01',
      endDate: '2025-01-15',
      payScheduleUuid: 'schedule-1',
    }

    it('emits runPayroll/selected with the payroll uuid and pay period', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      server.use(...buildPayrollListHandlers({ payrolls: [createListPayroll()] }))

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await user.click(await screen.findByRole('button', { name: 'Run Payroll' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_SELECTED, {
        payrollUuid: 'payroll-regular-1',
        payPeriod,
      })
    })

    it('emits payroll/review for a calculated payroll', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      server.use(
        ...buildPayrollListHandlers({
          payrolls: [createListPayroll({ calculated_at: '2025-01-10T10:00:00Z' })],
        }),
      )

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await user.click(await screen.findByRole('button', { name: 'Review and submit' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.REVIEW_PAYROLL, {
        payrollUuid: 'payroll-regular-1',
        payPeriod,
      })
    })

    it('emits runPayroll/offCycle/start from the off-cycle call-to-action', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      server.use(...buildPayrollListHandlers({ payrolls: [createListPayroll()] }))

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await user.click(await screen.findByRole('button', { name: 'Run off-cycle payroll' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_OFF_CYCLE_PAYROLL)
    })

    it('hides the off-cycle call-to-action when withOffcyclePayroll is false', async () => {
      server.use(...buildPayrollListHandlers({ payrolls: [createListPayroll()] }))

      renderWithProviders(<PayrollList {...defaultProps} withOffcyclePayroll={false} />)

      await screen.findByRole('button', { name: 'Run Payroll' })
      expect(screen.queryByRole('button', { name: 'Run off-cycle payroll' })).toBeNull()
    })
  })

  describe('skip payroll', () => {
    const openSkipDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(await screen.findByRole('button', { name: /open menu/i }))
      await user.click(screen.getByText('Skip payroll'))
      await user.click(await screen.findByRole('button', { name: 'Yes, skip payroll' }))
    }

    it('posts a Regular skip request and emits payroll/skipped on success', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      let skipBody: Record<string, unknown> | null = null
      const skipResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        skipBody = (await request.json()) as Record<string, unknown>
        return new HttpResponse(null, { status: 202, headers: { 'content-length': '0' } })
      })
      server.use(
        ...buildPayrollListHandlers({ payrolls: [createListPayroll()] }),
        handleSkipPayroll(skipResolver),
      )

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await openSkipDialog(user)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.PAYROLL_SKIPPED, {
          payrollId: 'payroll-regular-1',
        })
      })
      expect(skipResolver).toHaveBeenCalledTimes(1)
      expect(skipBody).toMatchObject({
        payroll_type: 'Regular',
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        pay_schedule_uuid: 'schedule-1',
      })
      expect(await screen.findByText('Payroll skipped')).toBeInTheDocument()
    })

    it('posts a transition skip request for transition off-cycle payrolls', async () => {
      const user = userEvent.setup()
      let skipBody: Record<string, unknown> | null = null
      const skipResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        skipBody = (await request.json()) as Record<string, unknown>
        return new HttpResponse(null, { status: 202, headers: { 'content-length': '0' } })
      })
      server.use(
        ...buildPayrollListHandlers({
          payrolls: [createOffCyclePayroll('Transition from old pay schedule')],
        }),
        handleSkipPayroll(skipResolver),
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      await openSkipDialog(user)

      await waitFor(() => {
        expect(skipResolver).toHaveBeenCalledTimes(1)
      })
      expect(skipBody).toMatchObject({ payroll_type: 'Transition from old pay schedule' })
    })

    it('shows no success alert and emits no skipped event when the skip request fails', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      const skipResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(
          { errors: [{ error_key: 'base', message: 'Cannot skip' }] },
          { status: 422 },
        ),
      )
      server.use(
        ...buildPayrollListHandlers({ payrolls: [createListPayroll()] }),
        handleSkipPayroll(skipResolver),
      )

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await openSkipDialog(user)

      await waitFor(() => {
        expect(skipResolver).toHaveBeenCalledTimes(1)
      })
      expect(onEvent).not.toHaveBeenCalledWith(componentEvents.PAYROLL_SKIPPED, expect.anything())
      expect(screen.queryByText('Payroll skipped')).toBeNull()
    })
  })

  describe('delete payroll', () => {
    const openDeleteDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(await screen.findByRole('button', { name: /open menu/i }))
      await user.click(screen.getByText('Cancel payroll'))
      await user.click(await screen.findByRole('button', { name: 'Yes, cancel payroll' }))
    }

    it('deletes the payroll, shows the success alert, and emits payroll/deleted', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      let deletePath: string | null = null
      const deleteResolver = vi.fn<HttpResponseResolver>(({ request }) => {
        deletePath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      })
      const bonusPayroll = createOffCyclePayroll('Bonus')
      server.use(
        ...buildPayrollListHandlers({ payrolls: [bonusPayroll] }),
        handleDeletePayroll(deleteResolver),
      )

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await openDeleteDialog(user)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.PAYROLL_DELETED, {
          payrollId: bonusPayroll.payroll_uuid,
        })
      })
      expect(deletePath).toBe(
        `/v1/companies/${defaultProps.companyId}/payrolls/${bonusPayroll.payroll_uuid}`,
      )
      expect(await screen.findByText('Payroll cancelled')).toBeInTheDocument()
    })

    it('emits no deleted event when the delete request fails', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      const deleteResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(
          { errors: [{ error_key: 'base', message: 'Cannot cancel' }] },
          { status: 422 },
        ),
      )
      server.use(
        ...buildPayrollListHandlers({ payrolls: [createOffCyclePayroll('Bonus')] }),
        handleDeletePayroll(deleteResolver),
      )

      renderWithProviders(<PayrollList {...defaultProps} onEvent={onEvent} />)

      await openDeleteDialog(user)

      await waitFor(() => {
        expect(deleteResolver).toHaveBeenCalledTimes(1)
      })
      expect(onEvent).not.toHaveBeenCalledWith(componentEvents.PAYROLL_DELETED, expect.anything())
      expect(screen.queryByText('Payroll cancelled')).toBeNull()
    })
  })

  describe('blockers', () => {
    it('hides the skip menu when company blockers exist', async () => {
      server.use(
        ...buildPayrollListHandlers({
          payrolls: [createListPayroll()],
          blockers: [{ key: 'missing_bank_info', message: 'Company needs a bank account.' }],
        }),
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      await screen.findByRole('button', { name: 'Run Payroll' })
      expect(screen.queryByRole('button', { name: /open menu/i })).toBeNull()
    })
  })

  describe('date filtering and pagination', () => {
    it('requests the next page with page=2', async () => {
      const user = userEvent.setup()
      const requestedPages: Array<string | null> = []
      const payrollsResolver = vi.fn<HttpResponseResolver>(({ request }) => {
        requestedPages.push(new URL(request.url).searchParams.get('page'))
        return HttpResponse.json([createListPayroll()], {
          headers: { 'x-total-pages': '2', 'x-total-count': '10' },
        })
      })
      server.use(...buildPayrollListHandlers({ payrollsResolver }))

      renderWithProviders(<PayrollList {...defaultProps} />)

      await screen.findByRole('button', { name: 'Run Payroll' })
      await user.click(screen.getByTestId('pagination-next'))

      await waitFor(() => {
        expect(requestedPages).toContain('2')
      })
    })
  })

  describe('date filter', () => {
    const paginatedHeaders = { 'x-total-pages': '2', 'x-total-count': '10' }

    const enterDate = async (
      user: ReturnType<typeof userEvent.setup>,
      fieldLabel: 'Start Date' | 'End Date',
      digits: string,
    ) => {
      await user.click(
        await screen.findByRole('spinbutton', { name: new RegExp(`month, ${fieldLabel}`) }),
      )
      await user.keyboard(digits)
    }

    const recordRequests = () => {
      const requests: URL[] = []
      const payrollsResolver = vi.fn<HttpResponseResolver>(({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json([createListPayroll()], { headers: paginatedHeaders })
      })
      server.use(...buildPayrollListHandlers({ payrollsResolver }))
      return { requests, payrollsResolver }
    }

    it('re-queries with the applied date range and resets to page 1', async () => {
      const user = userEvent.setup()
      const { requests } = recordRequests()

      renderWithProviders(<PayrollList {...defaultProps} />)

      await screen.findByRole('button', { name: 'Run Payroll' })
      await user.click(screen.getByTestId('pagination-next'))
      await waitFor(() => {
        expect(requests.at(-1)!.searchParams.get('page')).toBe('2')
      })

      await user.click(screen.getByRole('button', { name: /^Filter by date,/ }))
      await enterDate(user, 'Start Date', '02012030')
      await enterDate(user, 'End Date', '03012030')
      await user.click(screen.getByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        const latest = requests.at(-1)!.searchParams
        expect(latest.get('start_date')).toBe('2030-02-01')
        expect(latest.get('end_date')).toBe('2030-03-01')
      })
      expect(requests.at(-1)!.searchParams.get('page')).toBe('1')
    })

    it('restores the default date window and page 1 on Reset', async () => {
      const user = userEvent.setup()
      const { requests } = recordRequests()

      renderWithProviders(<PayrollList {...defaultProps} />)

      await screen.findByRole('button', { name: 'Run Payroll' })
      const defaultStartDate = requests[0]!.searchParams.get('start_date')
      const defaultEndDate = requests[0]!.searchParams.get('end_date')

      await user.click(screen.getByRole('button', { name: /^Filter by date,/ }))
      await enterDate(user, 'Start Date', '02012030')
      await user.click(screen.getByRole('button', { name: 'Apply' }))
      await waitFor(() => {
        expect(requests.at(-1)!.searchParams.get('start_date')).toBe('2030-02-01')
      })

      await user.click(screen.getByRole('button', { name: /^Filter by date,/ }))
      await user.click(await screen.findByRole('button', { name: 'Reset' }))
      await user.click(screen.getByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        const latest = requests.at(-1)!.searchParams
        expect(latest.get('start_date')).toBe(defaultStartDate)
        expect(latest.get('end_date')).toBe(defaultEndDate)
        expect(latest.get('page')).toBe('1')
      })
    })

    it('shows the filtered empty state when a date range returns no payrolls', async () => {
      const user = userEvent.setup()
      const payrollsResolver = vi.fn<HttpResponseResolver>(({ request }) => {
        const startDate = new URL(request.url).searchParams.get('start_date')
        return HttpResponse.json(startDate === '2030-02-01' ? [] : [createListPayroll()])
      })
      server.use(...buildPayrollListHandlers({ payrollsResolver }))

      renderWithProviders(<PayrollList {...defaultProps} />)

      await screen.findByRole('button', { name: 'Run Payroll' })
      await user.click(screen.getByRole('button', { name: /^Filter by date,/ }))
      await enterDate(user, 'Start Date', '02012030')
      await user.click(screen.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText('No payrolls in this date range')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('surfaces an error when the payrolls request fails', async () => {
      server.use(
        ...buildPayrollListHandlers({
          payrollsResolver: () =>
            HttpResponse.json({ errors: [{ message: 'Server error' }] }, { status: 500 }),
        }),
      )

      renderWithProviders(<PayrollList {...defaultProps} />)

      expect(await screen.findByRole('alert')).toBeInTheDocument()
    })
  })
})
