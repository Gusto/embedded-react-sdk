import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useEmployeeCompensation } from './useEmployeeCompensation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployee, handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { handleDeleteCompensation } from '@/test/mocks/apis/compensations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'
import { FlsaStatus } from '@/shared/constants'

// Test fixtures — inlined to pin behaviour to specific values rather than a
// moving fixture file.
type JobFixture = Record<string, unknown>

const ONE_YEAR_AHEAD = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]!
})()
const TWO_YEARS_AHEAD = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 2)
  return d.toISOString().split('T')[0]!
})()

const buildEmployee = (overrides: Record<string, unknown> = {}) => ({
  uuid: 'employee-123',
  first_name: 'Isom',
  last_name: 'Jaskolski',
  email: 'isom@example.com',
  date_of_birth: '1986-06-25',
  has_ssn: true,
  ...overrides,
})

const baseJob = (
  overrides: Partial<JobFixture> = {},
  compensations: Record<string, unknown>[] = [],
): JobFixture => ({
  uuid: 'job-1',
  version: 'job-v1',
  employee_uuid: 'employee-123',
  current_compensation_uuid: 'comp-current',
  payment_unit: 'Hour',
  primary: true,
  title: 'Cashier',
  rate: '30.00',
  hire_date: '2024-01-01',
  compensations,
  ...overrides,
})

const baseComp = (overrides: Partial<Record<string, unknown>> = {}) => ({
  uuid: 'comp-current',
  version: 'comp-v1',
  payment_unit: 'Hour',
  flsa_status: 'Nonexempt',
  job_uuid: 'job-1',
  effective_date: '2024-01-01',
  rate: '30.00',
  adjust_for_minimum_wage: false,
  minimum_wages: [],
  ...overrides,
})

describe('useEmployeeCompensation', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts loading with both per-query flags true and resolves to populated data', async () => {
    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.status.isEmployeeLoading).toBe(true)
    expect(result.current.status.isPayStubsLoading).toBe(true)
    expect(result.current.data.jobs).toEqual([])
    expect(result.current.data.payStubs).toEqual([])

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
      expect(result.current.status.isPayStubsLoading).toBe(false)
    })

    expect(result.current.data.jobs.length).toBeGreaterThan(0)
  })

  it('derives primaryJob, primaryFlsaStatus, hasMultipleJobs, and employeeFirstName from the respective fetches', async () => {
    server.use(
      handleGetEmployee(() => HttpResponse.json(buildEmployee())),
      handleGetEmployeeJobs(() =>
        HttpResponse.json([baseJob({ primary: true }, [baseComp({ flsa_status: 'Nonexempt' })])]),
      ),
    )

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
    })

    expect(result.current.data.primaryJob).toMatchObject({ uuid: 'job-1', primary: true })
    expect(result.current.data.primaryFlsaStatus).toBe(FlsaStatus.NONEXEMPT)
    expect(result.current.data.hasMultipleJobs).toBe(false)
    expect(result.current.data.employeeFirstName).toBe('Isom')
  })

  it('reports hasMultipleJobs=true and surfaces all jobs when the employee has more than one', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json([
          baseJob({ uuid: 'job-primary', primary: true, title: 'Manager' }, [
            baseComp({ uuid: 'comp-primary', job_uuid: 'job-primary' }),
          ]),
          baseJob({ uuid: 'job-secondary', primary: false, title: 'Cashier' }, [
            baseComp({ uuid: 'comp-secondary', job_uuid: 'job-secondary' }),
          ]),
        ]),
      ),
    )

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
    })

    expect(result.current.data.hasMultipleJobs).toBe(true)
    expect(result.current.data.jobs).toHaveLength(2)
    expect(result.current.data.primaryJob?.uuid).toBe('job-primary')
  })

  it('derives pendingChanges from future-effective compensations on each job', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json([
          baseJob({ uuid: 'job-primary', current_compensation_uuid: 'comp-primary-current' }, [
            baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
            baseComp({
              uuid: 'comp-primary-future',
              job_uuid: 'job-primary',
              rate: '35.00',
              effective_date: ONE_YEAR_AHEAD,
            }),
          ]),
        ]),
      ),
    )

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
    })

    expect(result.current.data.pendingChanges).toHaveLength(1)
    expect(result.current.data.pendingChanges[0]).toMatchObject({
      compensationUuid: 'comp-primary-future',
      effectiveDate: ONE_YEAR_AHEAD,
    })
  })

  it('actions.cancelPendingChange fires DELETE /v1/compensations/:id and returns a HookSubmitResult', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json([
          baseJob({}, [
            baseComp(),
            baseComp({
              uuid: 'comp-future',
              rate: '35.00',
              effective_date: ONE_YEAR_AHEAD,
            }),
          ]),
        ]),
      ),
    )

    let deletePath: string | null = null
    const deleteResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      deletePath = new URL(request.url).pathname
      return new HttpResponse(null, { status: 204 })
    })
    server.use(handleDeleteCompensation(deleteResolver))

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.data.pendingChanges).toHaveLength(1)
    })
    const change = result.current.data.pendingChanges[0]!

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.actions.cancelPendingChange(change)
    })

    expect(deleteResolver).toHaveBeenCalledTimes(1)
    expect(deletePath).toBe('/v1/compensations/comp-future')
    expect(submitResult).toMatchObject({ mode: 'update' })
  })

  it('surfaces a failing cancel mutation through errorHandling.errors and leaves submitResult undefined', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json([
          baseJob({}, [
            baseComp(),
            baseComp({
              uuid: 'comp-future',
              rate: '35.00',
              effective_date: TWO_YEARS_AHEAD,
            }),
          ]),
        ]),
      ),
    )
    server.use(
      handleDeleteCompensation(() =>
        HttpResponse.json(
          { errors: [{ category: 'invalid_attribute_value', message: 'Cannot cancel' }] },
          { status: 422 },
        ),
      ),
    )

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.data.pendingChanges).toHaveLength(1)
    })
    const change = result.current.data.pendingChanges[0]!

    let submitResult: unknown = 'unset'
    await act(async () => {
      submitResult = await result.current.actions.cancelPendingChange(change)
    })

    expect(submitResult).toBeUndefined()
    expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
  })

  it('requests the jobs endpoint so JobAndPay sees compensation history with titles', async () => {
    let jobsRequestUrl: string | null = null
    server.use(
      handleGetEmployeeJobs(({ request }) => {
        jobsRequestUrl = request.url
        return HttpResponse.json([baseJob({}, [baseComp()])])
      }),
    )

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isEmployeeLoading).toBe(false)
    })

    expect(jobsRequestUrl).not.toBeNull()
    expect(jobsRequestUrl).toContain('/v1/employees/employee-123/jobs')
    expect(jobsRequestUrl).toContain('include=all_compensations')
  })

  it('surfaces paystub pagination control props once the paystubs query resolves', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_uuid/pay_stubs`, () =>
        HttpResponse.json([], {
          headers: { 'x-total-count': '0', 'x-total-pages': '1', 'x-page': '1' },
        }),
      ),
    )

    const { result } = renderHook(() => useEmployeeCompensation({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.status.isPayStubsLoading).toBe(false)
    })

    expect(result.current.pagination.payStubs).toBeDefined()
  })
})
