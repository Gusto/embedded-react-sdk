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

const MULTI_WORKWEEK_PREPARE = {
  payroll_uuid: 'payroll-1',
  uuid: 'payroll-1',
  off_cycle: false,
  external: false,
  pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
  workweeks: [
    { start_date: '2024-01-01', end_date: '2024-01-07' },
    { start_date: '2024-01-08', end_date: '2024-01-14' },
  ],
  employee_compensations: [
    {
      employee_uuid: 'emp-1',
      gross_pay: '1500.00',
      version: 'comp-v2',
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

const MULTI_WORKWEEK_NO_BREAKDOWNS_PREPARE = {
  payroll_uuid: 'payroll-1',
  uuid: 'payroll-1',
  off_cycle: false,
  external: false,
  pay_period: { start_date: '2024-01-01', end_date: '2024-01-14' },
  workweeks: [
    { start_date: '2024-01-01', end_date: '2024-01-07' },
    { start_date: '2024-01-08', end_date: '2024-01-14' },
  ],
  employee_compensations: [
    {
      employee_uuid: 'emp-1',
      gross_pay: '1200.00',
      version: 'comp-v3',
      payment_method: 'Direct Deposit',
      hourly_compensations: [
        {
          job_uuid: 'job-1',
          name: 'Regular Hours',
          hours: '80.000',
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

// A two-workweek payroll whose hourly line carries breakdowns and a given FLSA status.
function multiWorkweekPrepareWithFlsa(flsaStatus: string | undefined) {
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

  it('tiles every workweek exactly for a multi-workweek pay period', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(MULTI_WORKWEEK_PREPARE)))

    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(MULTI_WORKWEEK_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    // This fixture's Regular-Hours-only line carries no existing overtime, so the
    // editor starts collapsed; reveal to exercise the split/tiling path.
    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
    })
    const ready = result.current

    await act(async () => {
      await ready.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations![0]!
    expect(hourly).toMatchObject({ name: 'Regular Hours', hours: '60' })
    expect(hourly.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '40' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '20' },
    ])

    const tiledHours = hourly.breakdowns!.reduce(
      (sum, breakdown) => sum + parseFloat(breakdown.hours ?? '0'),
      0,
    )
    expect(String(tiledHours)).toBe(hourly.hours)
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

  it('splits the hours section by workweek once revealed for a multi-workweek pay period', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(MULTI_WORKWEEK_PREPARE)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    // No existing overtime in this fixture, so it starts collapsed.
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(false)
    expect(result.current.data.isMultipleWorkweeks).toBe(true)

    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })

    await waitFor(() => {
      assertReady(result.current)
      const { hours } = result.current.form.Fields.jobs[0]!
      expect(isSplitByWorkweek(hours)).toBe(true)
      expect(Object.keys(hours as Record<string, HourEntry[]>)).toEqual([
        '2024-01-01',
        '2024-01-08',
      ])
    })
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

  it('resends the original total without breakdowns when a multi-workweek line is left unsplit', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(MULTI_WORKWEEK_NO_BREAKDOWNS_PREPARE)))

    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(MULTI_WORKWEEK_NO_BREAKDOWNS_PREPARE)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    // No existing overtime, so this starts collapsed (flat) by default -- no
    // reveal needed; collapsed is itself the "left unsplit" state under test.
    expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(false)
    const ready = result.current

    // Save without touching any week cell.
    await act(async () => {
      await ready.actions.onSubmit()
    })

    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations![0]!
    expect(hourly.hours).toBe('80')
    expect(hourly).not.toHaveProperty('breakdowns')
  })

  it.each(['Nonexempt', 'Salaried Nonexempt', 'Commission Only Nonexempt'])(
    'splits hours by workweek once revealed for the overtime-eligible status %s',
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
      // No existing overtime in this fixture, so it starts collapsed.
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(false)

      act(() => {
        assertReady(result.current)
        result.current.actions.revealOvertime()
      })

      await waitFor(() => {
        assertReady(result.current)
        expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
        expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.additionalEarnings)).toBe(true)
      })
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

    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
    })
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

  it('persists an entered week and tiles the whole job when one cell is edited', async () => {
    const prepare = {
      ...MULTI_WORKWEEK_PREPARE,
      employee_compensations: [
        {
          ...MULTI_WORKWEEK_PREPARE.employee_compensations[0],
          hourly_compensations: [
            { job_uuid: 'job-1', name: 'Regular Hours', hours: '40', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Overtime', hours: '0', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Double overtime', hours: '0', flsa_status: 'Nonexempt' },
          ],
        },
      ],
    }
    server.use(handlePayrollsPrepare(() => HttpResponse.json(prepare)))
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(prepare)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    // No existing overtime, so reveal the split before entering a per-week value.
    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(isSplitByWorkweek(result.current.form.Fields.jobs[0]!.hours)).toBe(true)
    })
    const ready = result.current

    // Enter Overtime for the first workweek only.
    act(() => {
      ready.form.hookFormInternals.formMethods.setValue('hours.job-1.Overtime.2024-01-01', '5')
    })
    await act(async () => {
      await ready.actions.onSubmit()
    })

    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations!
    const overtime = hourly.find(line => line.name === 'Overtime')!
    expect(overtime.hours).toBe('5')
    expect(overtime.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '5' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '0' },
    ])
    // The whole job tiles so the API's all-or-nothing rule holds.
    expect(hourly.every(line => Array.isArray(line.breakdowns))).toBe(true)
  })

  it('blocks submit and does not call the update endpoint when an amount is negative', async () => {
    server.use(handlePayrollsPrepare(() => HttpResponse.json(SINGLE_WORKWEEK_PREPARE)))
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(SINGLE_WORKWEEK_PREPARE),
    )
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    act(() => {
      ready.form.hookFormInternals.formMethods.setValue(
        'hours.job-1.Regular Hours.2024-01-01',
        '-5',
      )
    })

    let submitResult: Awaited<ReturnType<typeof ready.actions.onSubmit>>
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('starts collapsed (flat, overtime hidden) for an eligible employee with no existing overtime', async () => {
    const prepare = {
      ...MULTI_WORKWEEK_PREPARE,
      employee_compensations: [
        {
          ...MULTI_WORKWEEK_PREPARE.employee_compensations[0],
          hourly_compensations: [
            { job_uuid: 'job-1', name: 'Regular Hours', hours: '80', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Overtime', hours: '0', flsa_status: 'Nonexempt' },
          ],
        },
      ],
    }
    server.use(handlePayrollsPrepare(() => HttpResponse.json(prepare)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    const job = result.current.form.Fields.jobs[0]!
    expect(job.hasHiddenOvertime).toBe(true)
    expect(isSplitByWorkweek(job.hours)).toBe(false)
    expect((job.hours as HourEntry[]).map(entry => entry.name)).toEqual(['Regular Hours'])
  })

  it('starts revealed (split, overtime visible) for an eligible employee with existing overtime hours', async () => {
    const prepare = {
      ...MULTI_WORKWEEK_PREPARE,
      employee_compensations: [
        {
          ...MULTI_WORKWEEK_PREPARE.employee_compensations[0],
          hourly_compensations: [
            { job_uuid: 'job-1', name: 'Regular Hours', hours: '80', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Overtime', hours: '5', flsa_status: 'Nonexempt' },
          ],
        },
      ],
    }
    server.use(handlePayrollsPrepare(() => HttpResponse.json(prepare)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    const job = result.current.form.Fields.jobs[0]!
    expect(job.hasHiddenOvertime).toBe(false)
    expect(isSplitByWorkweek(job.hours)).toBe(true)
    expect(
      Object.values(job.hours as Record<string, HourEntry[]>)[0]!.map(entry => entry.name),
    ).toEqual(expect.arrayContaining(['Regular Hours', 'Overtime']))
  })

  it('revealOvertime splits the hours section and un-hides the Overtime row', async () => {
    const prepare = {
      ...MULTI_WORKWEEK_PREPARE,
      employee_compensations: [
        {
          ...MULTI_WORKWEEK_PREPARE.employee_compensations[0],
          hourly_compensations: [
            { job_uuid: 'job-1', name: 'Regular Hours', hours: '80', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Overtime', hours: '0', flsa_status: 'Nonexempt' },
          ],
        },
      ],
    }
    server.use(handlePayrollsPrepare(() => HttpResponse.json(prepare)))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.form.Fields.jobs[0]!.hasHiddenOvertime).toBe(true)

    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.form.Fields.jobs[0]!.hasHiddenOvertime).toBe(false)
    })
    const job = result.current.form.Fields.jobs[0]!
    expect(isSplitByWorkweek(job.hours)).toBe(true)
    const weekOne = (job.hours as Record<string, HourEntry[]>)['2024-01-01']!
    expect(weekOne.map(entry => entry.name)).toEqual(
      expect.arrayContaining(['Regular Hours', 'Overtime']),
    )
  })

  it("preserves an untouched sibling line's total via an even split when Save is pressed right after revealing", async () => {
    const prepare = {
      ...MULTI_WORKWEEK_PREPARE,
      employee_compensations: [
        {
          ...MULTI_WORKWEEK_PREPARE.employee_compensations[0],
          hourly_compensations: [
            { job_uuid: 'job-1', name: 'Regular Hours', hours: '80', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Overtime', hours: '0', flsa_status: 'Nonexempt' },
          ],
        },
      ],
    }
    server.use(handlePayrollsPrepare(() => HttpResponse.json(prepare)))
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(prepare)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    // Reveal without touching Regular Hours at all.
    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.form.Fields.jobs[0]!.hasHiddenOvertime).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    // Regular Hours was never touched, but Overtime activating the job's
    // breakdown mode must not silently zero it: an even split keeps its
    // original 80-hour total intact rather than losing it to blank cells.
    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations!
    const regularHours = hourly.find(line => line.name === 'Regular Hours')!
    expect(regularHours.hours).toBe('80')
    expect(regularHours.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '40' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '40' },
    ])
  })

  it('submits a real breakdown once the user enters a per-week value after revealing', async () => {
    const prepare = {
      ...MULTI_WORKWEEK_PREPARE,
      employee_compensations: [
        {
          ...MULTI_WORKWEEK_PREPARE.employee_compensations[0],
          hourly_compensations: [
            { job_uuid: 'job-1', name: 'Regular Hours', hours: '80', flsa_status: 'Nonexempt' },
            { job_uuid: 'job-1', name: 'Overtime', hours: '0', flsa_status: 'Nonexempt' },
          ],
        },
      ],
    }
    server.use(handlePayrollsPrepare(() => HttpResponse.json(prepare)))
    let updateBody: CapturedBody | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as CapturedBody
      return HttpResponse.json(prepare)
    })
    server.use(handlePayrollsUpdate(updateResolver))

    const { result } = renderPayrollEditEmployeeForm()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    act(() => {
      assertReady(result.current)
      result.current.actions.revealOvertime()
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.form.Fields.jobs[0]!.hasHiddenOvertime).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue(
        'hours.job-1.Overtime.2024-01-01',
        '5',
      )
    })
    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    const hourly = updateBody!.employee_compensations[0]!.hourly_compensations!
    const overtime = hourly.find(line => line.name === 'Overtime')!
    expect(overtime.hours).toBe('5')
    expect(overtime.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '5' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '0' },
    ])

    // Regular Hours was never touched by this edit, but the job's breakdown
    // mode is all-or-nothing once any cell in it is touched (Overtime, here).
    // Without the even-split seeding, Regular Hours' untouched, blank cells
    // would submit as 0 -- silently zeroing an employee's regular hours the
    // moment they enter overtime for a different line in the same job.
    const regularHours = hourly.find(line => line.name === 'Regular Hours')!
    expect(regularHours.hours).toBe('80')
    expect(regularHours.breakdowns).toEqual([
      { start_date: '2024-01-01', end_date: '2024-01-07', hours: '40' },
      { start_date: '2024-01-08', end_date: '2024-01-14', hours: '40' },
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
