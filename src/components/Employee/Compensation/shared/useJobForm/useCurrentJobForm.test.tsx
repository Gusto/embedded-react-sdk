import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useCurrentJobForm } from './useCurrentJobForm'
import type { UseJobFormResult } from './useJobForm'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeJobs,
  handleCreateEmployeeJob,
  handleUpdateEmployeeJob,
} from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { buildEmployeeWithJobs, buildJob } from '@/test/factories/jobsAndCompensations'

type ReadyResult = Extract<UseJobFormResult, { isLoading: false }>

function assertReady(hookResult: UseJobFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('useCurrentJobForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('lands in update mode when a primary job exists', async () => {
    let updateJobPath: string | null = null
    const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateJobPath = new URL(request.url).pathname
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'job-uuid',
        version: 'v2',
        employee_uuid: 'employee-uuid',
        current_compensation_uuid: 'compensation-uuid',
        payment_unit: 'Hour',
        primary: true,
        title: body.title ?? 'My Job',
        hire_date: body.hire_date ?? '2024-12-24',
        two_percent_shareholder: false,
        state_wc_covered: false,
        state_wc_class_code: null,
        compensations: [],
        rate: '100.00',
      })
    })

    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
      handleUpdateEmployeeJob(updateJobResolver),
    )

    const { result } = renderHook(() => useCurrentJobForm({ employeeId: 'employee-uuid' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('update')
    expect(result.current.data.currentJob?.uuid).toBe('job-uuid')

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    expect(updateJobResolver).toHaveBeenCalledTimes(1)
    expect(updateJobPath).toBe('/v1/jobs/job-uuid')
  })

  it('routes to the primary job specifically (ignores secondaries)', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json([
          buildJob({
            uuid: 'secondary-job-uuid',
            primary: false,
            title: 'Secondary',
          }),
          buildJob({
            uuid: 'primary-job-uuid',
            primary: true,
            title: 'Primary',
            currentCompensationUuid: 'primary-comp-uuid',
          }),
        ]),
      ),
    )

    const { result } = renderHook(() => useCurrentJobForm({ employeeId: 'employee-uuid' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.currentJob?.uuid).toBe('primary-job-uuid')
    expect(result.current.data.currentJob?.title).toBe('Primary')
  })

  it('falls back to create mode when employee has no jobs', async () => {
    let createJobPath: string | null = null
    const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createJobPath = new URL(request.url).pathname
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        {
          uuid: 'new-job-uuid',
          version: 'v1',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'comp-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: body.title,
          hire_date: body.hire_date,
          two_percent_shareholder: false,
          state_wc_covered: false,
          state_wc_class_code: null,
          compensations: [],
          rate: '0.00',
        },
        { status: 201 },
      )
    })

    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateEmployeeJob(createJobResolver),
    )

    const { result } = renderHook(
      () =>
        useCurrentJobForm({
          employeeId: 'employee-uuid',
          defaultValues: { title: 'New Hire', hireDate: '2025-02-01' },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('create')
    expect(result.current.data.currentJob).toBeNull()

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    expect(createJobResolver).toHaveBeenCalledTimes(1)
    expect(createJobPath).toBe('/v1/employees/employee-uuid/jobs')
  })
})
