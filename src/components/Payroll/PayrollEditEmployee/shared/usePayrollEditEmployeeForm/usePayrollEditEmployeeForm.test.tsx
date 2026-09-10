import { renderHook, act, waitFor } from '@testing-library/react'
import { Suspense, type ReactNode } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  usePayrollEditEmployeeForm,
  type UsePayrollEditEmployeeFormResult,
} from './usePayrollEditEmployeeForm'
import { isSplitByWorkweek, type EarningEntry, type HourEntry } from './fields'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { handleGetEmployee } from '@/test/mocks/apis/employees'
import { handlePayrollsPrepare, handlePayrollsUpdate } from '@/test/mocks/apis/payrolls'
import { getEmptyEmployeeBankAccounts } from '@/test/mocks/apis/employeesBankAccounts'

type ReadyResult = Extract<UsePayrollEditEmployeeFormResult, { isLoading: false }>

function assertReady(result: UsePayrollEditEmployeeFormResult): asserts result is ReadyResult {
  if (result.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const EMPLOYEE_RESPONSE = {
  uuid: 'emp-1',
  first_name: 'John',
  last_name: 'Doe',
  jobs: [{ uuid: 'job-1', title: 'Engineer', primary: true }],
}

const SINGLE_WORKWEEK_PREPARE = {
  payroll_uuid: 'payroll-1',
  uuid: 'payroll-1',
  off_cycle: false,
  external: false,
  pay_period: { start_date: '2024-01-01', end_date: '2024-01-07' },
  workweeks: [{ start_date: '2024-01-01', end_date: '2024-01-07' }],
  fixed_compensation_types: [
    { name: 'Bonus' },
    { name: 'Commission' },
    { name: 'Correction Payment' },
    { name: 'Cash Tips' },
    { name: 'Paycheck Tips' },
    { name: 'Reimbursement' },
  ],
  employee_compensations: [
    {
      employee_uuid: 'emp-1',
      gross_pay: '1000.00',
      version: 'comp-v1',
      payment_method: 'Direct Deposit',
      hourly_compensations: [
        { job_uuid: 'job-1', name: 'Regular Hours', hours: '40.0', flsa_status: 'Nonexempt' },
      ],
      fixed_compensations: [{ job_uuid: 'job-1', name: 'Bonus', amount: '500.00' }],
      paid_time_off: [],
      reimbursements: [],
    },
  ],
}

const WORKWEEKS = [
  { start_date: '2024-01-01', end_date: '2024-01-07' },
  { start_date: '2024-01-08', end_date: '2024-01-14' },
]

// Case 1: no overtime hours and no breakdowns -> overtime off, collapsed on load.
const COLLAPSED_PREPARE = {
  payroll_uuid: 'payroll-1',
  uuid: 'payroll-1',
  off_cycle: false,
  external: false,
  pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
  workweeks: WORKWEEKS,
  employee_compensations: [
    {
      employee_uuid: 'emp-1',
      gross_pay: '1200.00',
      version: 'comp-collapsed',
      payment_method: 'Direct Deposit',
      hourly_compensations: [
        {
          job_uuid: 'job-1',
          name: 'Regular Hours',
          hours: '80',
          flsa_status: 'Nonexempt',
          breakdowns: [],
        },
        {
          job_uuid: 'job-1',
          name: 'Overtime',
          hours: '0',
          flsa_status: 'Nonexempt',
          breakdowns: [],
        },
      ],
      fixed_compensations: [],
      paid_time_off: [],
      reimbursements: [],
    },
  ],
}

// Case 1 variant with a single Regular Hours line, for the per-row validation flow.
const COLLAPSED_REGULAR_ONLY_PREPARE = {
  ...COLLAPSED_PREPARE,
  employee_compensations: [
    {
      ...COLLAPSED_PREPARE.employee_compensations[0],
      hourly_compensations: [
        {
          job_uuid: 'job-1',
          name: 'Regular Hours',
          hours: '80',
          flsa_status: 'Nonexempt',
          breakdowns: [],
        },
      ],
    },
  ],
}

// Case 2: existing breakdowns tiling the workweeks -> overtime on, split from breakdowns.
const BREAKDOWNS_PREPARE = {
  payroll_uuid: 'payroll-1',
  uuid: 'payroll-1',
  off_cycle: false,
  external: false,
  pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
  workweeks: WORKWEEKS,
  employee_compensations: [
    {
      employee_uuid: 'emp-1',
      gross_pay: '1500.00',
      version: 'comp-breakdowns',
      payment_method: 'Direct Deposit',
      hourly_compensations: [
        {
          job_uuid: 'job-1',
          name: 'Regular Hours',
          hours: '60.0',
          flsa_status: 'Nonexempt',
          breakdowns: [
            { start_date: '2024-01-01', end_date: '2024-01-07', hours: '40.0' },
            { start_date: '2024-01-08', end_date: '2024-01-14', hours: '20.0' },
          ],
        },
      ],
      fixed_compensations: [],
      paid_time_off: [],
      reimbursements: [],
    },
  ],
}

// Case 3: overtime hours but no matching breakdowns -> overtime on, first cell seeded only.
const OVERTIME_NO_BREAKDOWNS_PREPARE = {
  payroll_uuid: 'payroll-1',
  uuid: 'payroll-1',
  off_cycle: false,
  external: false,
  pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
  workweeks: WORKWEEKS,
  employee_compensations: [
    {
      employee_uuid: 'emp-1',
      gross_pay: '1700.00',
      version: 'comp-ot-flat',
      payment_method: 'Direct Deposit',
      hourly_compensations: [
        {
          job_uuid: 'job-1',
          name: 'Regular Hours',
          hours: '80',
          flsa_status: 'Nonexempt',
          breakdowns: [],
        },
        {
          job_uuid: 'job-1',
          name: 'Overtime',
          hours: '5',
          flsa_status: 'Nonexempt',
          breakdowns: [],
        },
      ],
      fixed_compensations: [],
      paid_time_off: [],
      reimbursements: [],
    },
  ],
}

interface CapturedBreakdown {
  start_date?: string
  end_date?: string
  hours?: string
  amount?: string
}
interface CapturedComp {
  employee_uuid?: string
  version?: string
  payment_method?: string
  hourly_compensations?: Array<{
    job_uuid?: string
    name?: string
    hours?: string
    breakdowns?: CapturedBreakdown[]
  }>
  fixed_compensations?: Array<{ name?: string; amount?: string; breakdowns?: CapturedBreakdown[] }>
}
interface CapturedBody {
  employee_compensations: CapturedComp[]
}

// A two-workweek payroll whose hourly line carries matching breakdowns and a given
// FLSA status (a case-2 fixture: overtime starts on for eligible employees).
function multiWorkweekPrepareWithFlsa(flsaStatus: string | undefined) {
  return {
    payroll_uuid: 'payroll-1',
    uuid: 'payroll-1',
    off_cycle: false,
    external: false,
    pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
    workweeks: WORKWEEKS,
    employee_compensations: [
      {
        employee_uuid: 'emp-1',
        gross_pay: '1500.00',
        version: 'comp-flsa',
        payment_method: 'Direct Deposit',
        hourly_compensations: [
          {
            job_uuid: 'job-1',
            name: 'Regular Hours',
            hours: '60.0',
            ...(flsaStatus ? { flsa_status: flsaStatus } : {}),
            breakdowns: [
              { start_date: '2024-01-01', end_date: '2024-01-07', hours: '40.0' },
              { start_date: '2024-01-08', end_date: '2024-01-14', hours: '20.0' },
            ],
          },
        ],
        fixed_compensations: [{ job_uuid: 'job-1', name: 'Bonus', amount: '500.00' }],
        paid_time_off: [],
        reimbursements: [],
      },
    ],
  }
}

const HOOK_PROPS = { employeeId: 'emp-1', companyId: 'company-1', payrollId: 'payroll-1' }

// The hook uses Suspense queries; in the real component BaseBoundaries supplies the
// boundary, so the test wrapper provides one too.
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <GustoTestProvider>
      <Suspense fallback={null}>{children}</Suspense>
    </GustoTestProvider>
  )
}

function renderPayrollEditEmployeeForm() {
  return renderHook(() => usePayrollEditEmployeeForm(HOOK_PROPS), { wrapper: Wrapper })
}

describe('usePayrollEditEmployeeForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetEmployee(() => HttpResponse.json(EMPLOYEE_RESPONSE)))
  })

  it('transitions from loading to ready with the prepared payroll and normalized workweeks', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(SINGLE_WORKWEEK_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.employee).toMatchObject({ firstName: 'John', lastName: 'Doe' })
    expect(result.current.data.employeeCompensation).toMatchObject({ grossPay: '1000.00' })
    expect(result.current.data.isMultipleWorkweeks).toBe(false)
    expect(result.current.data.preparedPayroll.workweeks).toHaveLength(1)
    expect(result.current.status).toEqual({ isPending: false, mode: 'update' })
  })

  it('submits totals without breakdowns for a single-workweek pay period', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(SINGLE_WORKWEEK_PREPARE)))

    let updatePath: string | null = null
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updatePath = new URL(request.url).pathname
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(SINGLE_WORKWEEK_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    let submitResult: Awaited<ReturnType<typeof ready.actions.onSubmit>>
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updatePath).toBe('/v1/companies/company-1/payrolls/payroll-1')

    const compensation = updateBody!.employee_compensations[0]!
    expect(compensation).toMatchObject({ employee_uuid: 'emp-1', version: 'comp-v1' })

    const hourly = compensation.hourly_compensations![0]!
    expect(hourly).toMatchObject({ job_uuid: 'job-1', name: 'Regular Hours', hours: '40' })
    expect(hourly).not.toHaveProperty('breakdowns')

    const fixed = compensation.fixed_compensations![0]!
    expect(fixed).toMatchObject({ name: 'Bonus', amount: '500' })
    expect(fixed).not.toHaveProperty('breakdowns')

    expect(submitResult).toEqual(expect.objectContaining({ mode: 'update' }))
  })

  it('starts with overtime off and collapsed when there are no overtime hours and no breakdowns', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(COLLAPSED_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(result.current.data.withOvertime).toBe(false)
    const job = result.current.form.Fields.jobs[0]!
    expect(isSplitByWorkweek(job.hours)).toBe(false)
    // Overtime rows are filtered out of the flat view while overtime is off.
    expect((job.hours as HourEntry[]).map(entry => entry.name)).toEqual(['Regular Hours'])
  })

  it('starts with overtime on and split-from-breakdowns when breakdowns match the workweeks', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(BREAKDOWNS_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(result.current.data.withOvertime).toBe(true)
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)

    const { getValues } = result.current.form.hookFormInternals.formMethods
    expect(getValues('hours.job-1.Regular Hours.2024-01-01')).toBe('40')
    expect(getValues('hours.job-1.Regular Hours.2024-01-08')).toBe('20')
  })

  it('starts with overtime on and seeds only the first cell when there are overtime hours but no breakdowns', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(OVERTIME_NO_BREAKDOWNS_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(result.current.data.withOvertime).toBe(true)
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)

    const { getValues } = result.current.form.hookFormInternals.formMethods
    // Each line's total lands in its first cell; every other cell is blank.
    expect(getValues('hours.job-1.Regular Hours.2024-01-01')).toBe('80')
    expect(getValues('hours.job-1.Regular Hours.2024-01-08')).toBe('')
    expect(getValues('hours.job-1.Overtime.2024-01-01')).toBe('5')
    expect(getValues('hours.job-1.Overtime.2024-01-08')).toBe('')
  })

  it('addOvertime turns overtime on, splits the section, and seeds only the first cell', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(COLLAPSED_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data.withOvertime).toBe(false)

    act(() => {
      assertReady(result.current)
      result.current.actions.addOvertime()
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.data.withOvertime).toBe(true)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
    })

    // The Overtime row is un-hidden by turning overtime on.
    const weekOne = (result.current.form.Fields.jobs[0]!.hours as Record<string, HourEntry[]>)[
      '2024-01-01'
    ]!
    expect(weekOne.map(entry => entry.name)).toEqual(
      expect.arrayContaining(['Regular Hours', 'Overtime']),
    )

    const { getValues } = result.current.form.hookFormInternals.formMethods
    // First cell seeded with the total, every other cell blank -- no even split.
    expect(getValues('hours.job-1.Regular Hours.2024-01-01')).toBe('80')
    expect(getValues('hours.job-1.Regular Hours.2024-01-08')).toBe('')
  })

  it('seeds every company earning type, bucketed by overtime inclusion', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(SINGLE_WORKWEEK_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const { form, data } = result.current

    expect(Array.isArray(form.Fields.jobs[0]!.hours)).toBe(true)
    expect((form.Fields.jobs[0]!.hours as HourEntry[]).map(entry => entry.name)).toContain(
      'Regular Hours',
    )
    // Every company earning type is seeded (like the stable editor), even ones the prepared
    // payroll has no fixed compensation for. Overtime-included types (Bonus, Commission,
    // Correction Payment) become additional earnings; the rest (Cash/Paycheck Tips) become other.
    expect(
      (form.Fields.jobs[0]!.additionalEarnings as EarningEntry[]).map(entry => entry.name),
    ).toEqual(['Bonus', 'Commission', 'Correction Payment'])
    expect(form.Fields.other.map(entry => entry.id)).toEqual(['Cash Tips', 'Paycheck Tips'])
    expect(typeof form.Fields.paymentMethod).toBe('function')
    expect(data.isMultipleWorkweeks).toBe(false)
  })

  it('groups hours into one jobs entry per job, with titles', async () => {
    server.use(
      handleGetEmployee(() =>
        HttpResponse.json({
          uuid: 'emp-1',
          first_name: 'John',
          last_name: 'Doe',
          jobs: [
            { uuid: 'job-1', title: 'Engineer', primary: true },
            { uuid: 'job-2', title: 'Barista', primary: false },
          ],
        }),
      ),
    )
    server.use(
      handlePayrollsPrepare(() =>
        HttpResponse.json({
          ...SINGLE_WORKWEEK_PREPARE,
          employee_compensations: [
            {
              ...SINGLE_WORKWEEK_PREPARE.employee_compensations[0],
              fixed_compensations: [],
              hourly_compensations: [
                {
                  job_uuid: 'job-1',
                  name: 'Regular Hours',
                  hours: '40.0',
                  flsa_status: 'Nonexempt',
                },
                {
                  job_uuid: 'job-2',
                  name: 'Regular Hours',
                  hours: '10.0',
                  flsa_status: 'Nonexempt',
                },
              ],
            },
          ],
        }),
      ),
    )

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(
      result.current.form.Fields.jobs.map(job => ({ jobUuid: job.jobUuid, title: job.title })),
    ).toEqual([
      { jobUuid: 'job-1', title: 'Engineer' },
      { jobUuid: 'job-2', title: 'Barista' },
    ])
    expect((result.current.form.Fields.jobs[1]!.hours as HourEntry[])[0]).toMatchObject({
      jobUuid: 'job-2',
      name: 'Regular Hours',
    })
  })

  it('resends the original total without breakdowns when a multi-workweek line stays collapsed', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(COLLAPSED_REGULAR_ONLY_PREPARE)))

    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(COLLAPSED_REGULAR_ONLY_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    // Overtime off, so this starts collapsed (flat) -- the "left unsplit" state.
    expect(result.current.data.withOvertime).toBe(false)
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(false)
    const ready = result.current

    await act(async () => {
      await ready.actions.onSubmit()
    })

    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations![0]!
    expect(hourly.hours).toBe('80')
    expect(hourly).not.toHaveProperty('breakdowns')
  })

  it.each(['Nonexempt', 'Salaried Nonexempt', 'Commission Only Nonexempt'])(
    'starts split for the overtime-eligible status %s when breakdowns match',
    async flsaStatus => {
      server.use(
        handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepareWithFlsa(flsaStatus))),
      )
      const { result } = renderPayrollEditEmployeeForm()
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.data.isOvertimeEligible).toBe(true)
      expect(result.current.data.withOvertime).toBe(true)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.additionalEarnings)).toBe(true)
    },
  )

  it.each(['Exempt', 'Owner', 'Commission Only Exempt'])(
    'renders flat on a multi-workweek payroll for the overtime-ineligible status %s',
    async flsaStatus => {
      server.use(
        handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepareWithFlsa(flsaStatus))),
      )
      const { result } = renderPayrollEditEmployeeForm()
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.data.isOvertimeEligible).toBe(false)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(false)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.additionalEarnings)).toBe(false)
    },
  )

  it('defaults to flat when the FLSA status is unknown', async () => {
    server.use(
      handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepareWithFlsa(undefined))),
    )
    // The employee response carries no primary-job compensation FLSA either.
    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data.isOvertimeEligible).toBe(false)
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(false)
  })

  it('falls back to the primary job compensation FLSA status when the prepared line has none', async () => {
    server.use(
      handleGetEmployee(() =>
        HttpResponse.json({
          ...EMPLOYEE_RESPONSE,
          jobs: [
            {
              uuid: 'job-1',
              title: 'Engineer',
              primary: true,
              compensations: [{ uuid: 'comp-1', flsa_status: 'Nonexempt' }],
            },
          ],
        }),
      ),
      handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepareWithFlsa(undefined))),
    )
    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data.isOvertimeEligible).toBe(true)
    // Eligible + matching breakdowns -> starts split without any Add overtime click.
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
  })

  it('submits the total with no breakdowns for an overtime-ineligible multi-workweek line', async () => {
    server.use(
      handlePayrollsPrepare(() => HttpResponse.json(multiWorkweekPrepareWithFlsa('Exempt'))),
    )
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(multiWorkweekPrepareWithFlsa('Exempt'))
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current
    await act(async () => {
      await ready.actions.onSubmit()
    })

    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations![0]!
    expect(hourly).toMatchObject({ name: 'Regular Hours', hours: '60' })
    expect(hourly).not.toHaveProperty('breakdowns')
  })

  it('blocks submit on a partially-filled workweek row and never calls the update endpoint', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(COLLAPSED_REGULAR_ONLY_PREPARE)))
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(COLLAPSED_REGULAR_ONLY_PREPARE),
    )
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    // Turning overtime on seeds Regular Hours' first cell (80) and leaves the
    // second blank -- a partial row the validation must reject.
    act(() => {
      assertReady(result.current)
      result.current.actions.addOvertime()
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
    })
    const ready = result.current

    let submitResult: Awaited<ReturnType<typeof ready.actions.onSubmit>>
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('submits real breakdowns once every workweek cell of a row is filled', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(COLLAPSED_REGULAR_ONLY_PREPARE)))
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(COLLAPSED_REGULAR_ONLY_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    act(() => {
      assertReady(result.current)
      result.current.actions.addOvertime()
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
    })
    const ready = result.current

    // Fill the second cell (the first is seeded with the 80 total).
    act(() => {
      ready.form.hookFormInternals.formMethods.setValue(
        'hours.job-1.Regular Hours.2024-01-08',
        '40',
      )
    })
    await act(async () => {
      await ready.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations![0]!
    expect(hourly.hours).toBe('120')
    expect(hourly.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '80' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '40' },
    ])
  })

  it('submits breakdowns per line: a fully-filled line tiles while an untouched collapsed line stays flat', async () => {
    // job-1 is overtime-eligible (splits); job-2 is not in the split because it
    // has no overtime line -- it still renders, but here we exercise two lines on
    // the same eligible job.
    server.use(handlePayrollsPrepare(() => HttpResponse.json(OVERTIME_NO_BREAKDOWNS_PREPARE)))
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(OVERTIME_NO_BREAKDOWNS_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    // Both lines seed their first cell only; fill each line's remaining cell so
    // both rows are complete (partial rows would block submit).
    act(() => {
      ready.form.hookFormInternals.formMethods.setValue(
        'hours.job-1.Regular Hours.2024-01-08',
        '40',
      )
      ready.form.hookFormInternals.formMethods.setValue('hours.job-1.Overtime.2024-01-08', '3')
    })
    await act(async () => {
      await ready.actions.onSubmit()
    })

    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations!
    const regular = hourly.find(line => line.name === 'Regular Hours')!
    expect(regular.hours).toBe('120')
    expect(regular.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '80' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '40' },
    ])
    const overtime = hourly.find(line => line.name === 'Overtime')!
    expect(overtime.hours).toBe('8')
    expect(overtime.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '5' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '3' },
    ])
  })

  it('defaults payment method to Check and hides the field when the employee has no direct deposit', async () => {
    server.use(getEmptyEmployeeBankAccounts)
    server.use(handlePayrollsPrepare(() => HttpResponse.json(SINGLE_WORKWEEK_PREPARE)))

    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(SINGLE_WORKWEEK_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data.hasDirectDepositSetup).toBe(false)
    expect(result.current.form.Fields.paymentMethod).toBeUndefined()

    const ready = result.current
    await act(async () => {
      await ready.actions.onSubmit()
    })

    expect(updateBody!.employee_compensations[0]!.payment_method).toBe('Check')
  })
})
