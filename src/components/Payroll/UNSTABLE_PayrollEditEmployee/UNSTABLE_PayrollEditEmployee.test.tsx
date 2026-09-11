import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { UNSTABLE_PayrollEditEmployee } from './UNSTABLE_PayrollEditEmployee'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployee } from '@/test/mocks/apis/employees'
import { handlePayrollsPrepare, handlePayrollsUpdate } from '@/test/mocks/apis/payrolls'
import { componentEvents } from '@/shared/constants'

const EMPLOYEE_RESPONSE = {
  uuid: 'emp-1',
  first_name: 'John',
  last_name: 'Doe',
  jobs: [{ uuid: 'job-1', title: 'Engineer', primary: true }],
  eligible_paid_time_off: [{ name: 'Vacation Hours', accrual_balance: '40.0' }],
}

function multiWorkweekPrepare(overtimeHours: string) {
  return {
    payroll_uuid: 'payroll-1',
    uuid: 'payroll-1',
    off_cycle: false,
    external: false,
    pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
    workweeks: [
      { start_date: '2024-01-01', end_date: '2024-01-07' },
      { start_date: '2024-01-08', end_date: '2024-01-14' },
    ],
    fixed_compensation_types: [{ name: 'Bonus' }],
    employee_compensations: [
      {
        employee_uuid: 'emp-1',
        gross_pay: '2130.88',
        version: 'comp-v1',
        payment_method: 'Direct Deposit',
        hourly_compensations: [
          { job_uuid: 'job-1', name: 'Regular Hours', hours: '80', flsa_status: 'Nonexempt' },
          {
            job_uuid: 'job-1',
            name: 'Overtime',
            hours: overtimeHours,
            flsa_status: 'Nonexempt',
            // Real per-week breakdowns, as the API returns once overtime is entered for a
            // specific workweek -- needed for the "already revealed" fixture to seed a value
            // into a specific column rather than landing blank (see buildWeekMap).
            breakdowns:
              overtimeHours === '0'
                ? []
                : [
                    { start_date: '2024-01-01', end_date: '2024-01-07', hours: overtimeHours },
                    { start_date: '2024-01-08', end_date: '2024-01-14', hours: '0' },
                  ],
          },
        ],
        fixed_compensations: [],
        paid_time_off: [{ name: 'Vacation Hours', hours: '0' }],
        reimbursements: [],
      },
    ],
  }
}

function exemptSingleWorkweekPrepare() {
  return {
    payroll_uuid: 'payroll-1',
    uuid: 'payroll-1',
    off_cycle: false,
    external: false,
    pay_period: { start_date: '2024-01-01', end_date: '2024-01-07' },
    workweeks: [{ start_date: '2024-01-01', end_date: '2024-01-07' }],
    fixed_compensation_types: [],
    employee_compensations: [
      {
        employee_uuid: 'emp-1',
        gross_pay: '4000.00',
        version: 'comp-exempt',
        payment_method: 'Direct Deposit',
        hourly_compensations: [
          { job_uuid: 'job-1', name: 'Salary', hours: '40', flsa_status: 'Exempt' },
        ],
        fixed_compensations: [],
        paid_time_off: [],
        reimbursements: [],
      },
    ],
  }
}

const PROPS = { employeeId: 'emp-1', companyId: 'company-1', payrollId: 'payroll-1' }

describe('UNSTABLE_PayrollEditEmployee', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetEmployee(() => HttpResponse.json(EMPLOYEE_RESPONSE)))
  })

  it('starts collapsed with a single Hours input and an Add overtime button when overtime is zero', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    expect(await screen.findByRole('spinbutton', { name: /^Regular Hours/ })).toHaveValue(80)
    expect(screen.queryByRole('spinbutton', { name: /^Overtime/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add overtime' })).toBeInTheDocument()
  })

  it('reveals per-workweek columns and the Overtime row when Add overtime is clicked', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await screen.findByRole('button', { name: 'Add overtime' })
    await user.click(screen.getByRole('button', { name: 'Add overtime' }))

    expect(screen.queryByRole('button', { name: 'Add overtime' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: /^Regular Hours Jan 1–Jan 7, 2024/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: /^Regular Hours Jan 8–Jan 14, 2024/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: /^Overtime Jan 1–Jan 7, 2024/ }),
    ).toBeInTheDocument()
  })

  it('starts already split, with no Add overtime button, when the employee already has overtime hours', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('5'))))
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await screen.findByRole('spinbutton', { name: /^Overtime Jan 1–Jan 7, 2024/ })
    expect(screen.getByRole('spinbutton', { name: /^Overtime Jan 1–Jan 7, 2024/ })).toHaveValue(5)
    expect(screen.queryByRole('button', { name: 'Add overtime' })).not.toBeInTheDocument()
  })

  it('never shows Add overtime and stays flat for an overtime-ineligible employee', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(exemptSingleWorkweekPrepare())))
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    expect(await screen.findByRole('spinbutton', { name: /^Salary/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add overtime' })).not.toBeInTheDocument()
  })

  it('displays the server-provided gross pay', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('5'))))
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    expect(await screen.findByText('$2,130.88')).toBeInTheDocument()
  })

  it('shows the remaining time-off balance as hours are entered', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    const timeOffField = await screen.findByRole('spinbutton', { name: /^Vacation Hours/ })
    expect(screen.getByText('40 remaining')).toBeInTheDocument()

    await user.clear(timeOffField)
    await user.type(timeOffField, '8')

    await waitFor(() => {
      expect(screen.getByText('32 remaining')).toBeInTheDocument()
    })
  })

  it('adds, then removes, a one-time reimbursement', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Add one-time reimbursement' }))
    await user.type(screen.getByLabelText(/^Description/), 'Client lunch')
    await user.type(screen.getByLabelText(/^Amount/), '45')
    await user.click(screen.getByRole('button', { name: 'Save reimbursement' }))

    expect(await screen.findByText('Client lunch')).toBeInTheDocument()
    expect(screen.getByText('$45.00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Remove Client lunch reimbursement/ }))

    await waitFor(() => {
      expect(screen.queryByText('Client lunch')).not.toBeInTheDocument()
    })
  })

  it('saves and emits runPayroll/employee/saved with the updated prepared payroll', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    const updated = multiWorkweekPrepare('0')
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(updated)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await screen.findByRole('spinbutton', { name: /^Regular Hours/ })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED,
      expect.objectContaining({ payrollPrepared: expect.objectContaining({ uuid: 'payroll-1' }) }),
    )
    expect(updateBody).not.toBeNull()
  })

  it('blocks Save and shows the required-workweek error when a revealed row is left partially filled', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(multiWorkweekPrepare('0')),
    )
    server.use(handlePayrollsUpdate(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Add overtime' }))
    // addOvertime seeds each line's first workweek cell and leaves the second
    // blank -- a partial row. Saving must surface the required-workweek error.
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findAllByText('Enter an amount for every workweek')).not.toHaveLength(0)
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('saves per-workweek breakdowns once every revealed cell is filled', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(multiWorkweekPrepare('0'))
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Add overtime' }))

    // Regular Hours is seeded into its first cell, so its second must be filled
    // to complete the row. Overtime/Double-overtime are left entirely blank
    // (untouched), which is valid and simply sends nothing for them.
    const regularWeekTwo = screen.getByRole('spinbutton', {
      name: /^Regular Hours Jan 8–Jan 14, 2024/,
    })
    await user.clear(regularWeekTwo)
    await user.type(regularWeekTwo, '0')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(updateBody).not.toBeNull()
  })

  it('cancels without calling the update endpoint', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(multiWorkweekPrepare('0')),
    )
    server.use(handlePayrollsUpdate(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    await screen.findByRole('spinbutton', { name: /^Regular Hours/ })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('renders the payment method options', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepare('0'))))
    renderWithProviders(<UNSTABLE_PayrollEditEmployee {...PROPS} onEvent={onEvent} />)

    expect(await screen.findByLabelText('Direct deposit')).toBeChecked()
    expect(screen.getByLabelText('Check')).not.toBeChecked()
  })
})
