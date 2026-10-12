import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  buildPayrollListHandlers,
  createListPayroll,
  createOffCyclePayroll,
  createPaySchedule,
  createTransitionPayPeriod,
  handleDeletePayroll,
  handleSkipPayroll,
} from '../__fixtures__/payrollListMocks'
import { usePayrollList, type UsePayrollListReady } from './usePayrollList'
import { server } from '@/test/mocks/server'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

const companyId = 'company-123'
const wrapper = GustoTestProvider

async function renderReadyHook() {
  const rendered = renderHook(() => usePayrollList({ companyId }), { wrapper })
  await waitFor(() => {
    expect(rendered.result.current.isLoading).toBe(false)
  })
  const getReady = () => rendered.result.current as UsePayrollListReady
  return { ...rendered, getReady }
}

describe('usePayrollList headless contract', () => {
  beforeEach(() => {
    server.use(
      ...buildPayrollListHandlers({
        payrolls: [createListPayroll()],
        paySchedules: [createPaySchedule()],
        blockers: [{ key: 'missing_bank_info', message: 'Needs a bank account.' }],
      }),
    )
  })

  it('returns list data without mounting PayrollList', async () => {
    const rendered = renderHook(() => usePayrollList({ companyId }), { wrapper })
    expect(rendered.result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(rendered.result.current.isLoading).toBe(false)
    })
    const ready = rendered.result.current as UsePayrollListReady

    expect(ready.data.payrolls).toMatchObject([
      { payrollUuid: 'payroll-regular-1', payPeriod: { payScheduleUuid: 'schedule-1' } },
    ])
    expect(ready.data.paySchedules).toMatchObject([{ uuid: 'schedule-1' }])
    expect(ready.data.blockers).toEqual([
      { key: 'missing_bank_info', message: 'Needs a bank account.' },
    ])
    expect(ready.data.wireInRequests).toEqual([])
    expect(ready.status).toEqual({
      hasUnprocessedTransitions: false,
      skippingPayrollId: null,
      deletingPayrollId: null,
    })
    expect(ready.pagination.currentPage).toBe(1)
  })

  it('reports unprocessed transition pay periods', async () => {
    server.use(
      ...buildPayrollListHandlers({
        payrolls: [createListPayroll()],
        payPeriods: [createTransitionPayPeriod()],
      }),
    )

    const { getReady } = await renderReadyHook()

    expect(getReady().status.hasUnprocessedTransitions).toBe(true)
  })

  it('returns query errors before ready state and supports retry', async () => {
    const payrollsResolver = vi
      .fn<HttpResponseResolver>()
      .mockImplementationOnce(() =>
        HttpResponse.json({ message: 'Unable to load payrolls' }, { status: 500 }),
      )
      .mockImplementation(() => HttpResponse.json([createListPayroll()]))
    server.use(...buildPayrollListHandlers({ payrollsResolver }))

    const { result } = renderHook(() => usePayrollList({ companyId }), { wrapper })

    await waitFor(() => {
      expect(result.current.errorHandling.errors).toHaveLength(1)
    })
    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.errorHandling.retryQueries()
    })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.errorHandling.errors).toEqual([])
  })

  it('skips a regular payroll and runs the success callback', async () => {
    let skipBody: Record<string, unknown> | null = null
    const skipResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      skipBody = (await request.json()) as Record<string, unknown>
      return new HttpResponse(null, { status: 202 })
    })
    server.use(handleSkipPayroll(skipResolver))
    const onSuccess = vi.fn()
    const { result, getReady } = await renderReadyHook()

    await act(async () => {
      await getReady().actions.onSkip('payroll-regular-1', onSuccess)
    })

    expect(skipResolver).toHaveBeenCalledTimes(1)
    expect(skipBody).toMatchObject({
      payroll_type: 'Regular',
      start_date: '2025-01-01',
      end_date: '2025-01-15',
      pay_schedule_uuid: 'schedule-1',
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect((result.current as UsePayrollListReady).status.skippingPayrollId).toBeNull()
  })

  it('skips a transition payroll with the transition payroll type', async () => {
    server.use(
      ...buildPayrollListHandlers({
        payrolls: [createOffCyclePayroll('Transition from old pay schedule')],
      }),
    )
    let skipBody: Record<string, unknown> | null = null
    server.use(
      handleSkipPayroll(async ({ request }) => {
        skipBody = (await request.json()) as Record<string, unknown>
        return new HttpResponse(null, { status: 202 })
      }),
    )
    const { getReady } = await renderReadyHook()
    const payrollUuid = getReady().data.payrolls[0]!.payrollUuid!

    await act(async () => {
      await getReady().actions.onSkip(payrollUuid)
    })

    expect(skipBody).toMatchObject({ payroll_type: 'Transition from old pay schedule' })
  })

  it('surfaces a failed skip in errorHandling without running the success callback', async () => {
    server.use(
      handleSkipPayroll(() =>
        HttpResponse.json(
          { errors: [{ error_key: 'base', message: 'Cannot skip' }] },
          { status: 422 },
        ),
      ),
    )
    const onSuccess = vi.fn()
    const { result, getReady } = await renderReadyHook()

    await act(async () => {
      await getReady().actions.onSkip('payroll-regular-1', onSuccess)
    })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(result.current.errorHandling.errors).toHaveLength(1)
  })

  it('deletes a payroll using the company and payroll identifiers', async () => {
    let deletePath: string | null = null
    server.use(
      handleDeletePayroll(({ request }) => {
        deletePath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const onSuccess = vi.fn()
    const { result, getReady } = await renderReadyHook()

    await act(async () => {
      await getReady().actions.onDelete('payroll-off-cycle-bonus', onSuccess)
    })

    expect(deletePath).toBe(`/v1/companies/${companyId}/payrolls/payroll-off-cycle-bonus`)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect((result.current as UsePayrollListReady).status.deletingPayrollId).toBeNull()
  })

  it('exposes a date filter seeded with today through three months ahead', async () => {
    const { getReady } = await renderReadyHook()

    const { startDate, endDate } = getReady().dateRangeFilter
    expect(startDate).toBeInstanceOf(Date)
    expect(endDate!.getTime()).toBeGreaterThan(startDate!.getTime())
    expect(getReady().dateRangeFilter.isModified).toBe(false)
  })
})
