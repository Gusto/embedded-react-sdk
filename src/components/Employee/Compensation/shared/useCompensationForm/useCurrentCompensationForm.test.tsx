import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useCurrentCompensationForm } from './useCurrentCompensationForm'
import type { UseCompensationFormResult } from './useCompensationForm'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeJobs,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { handleCreateCompensation } from '@/test/mocks/apis/compensations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { buildEmployeeWithJobs, buildJob } from '@/test/factories/jobsAndCompensations'
import { FlsaStatus } from '@/shared/constants'

type ReadyResult = Extract<UseCompensationFormResult, { isLoading: false }>

function assertReady(hookResult: UseCompensationFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('useCurrentCompensationForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it("lands in update mode and resolves the primary job's currentCompensationUuid", async () => {
    let updateCompensationPath: string | null = null
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateCompensationPath = new URL(request.url).pathname
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'compensation-uuid',
        version: 'compensation-version-456',
        job_uuid: 'job-uuid',
        rate: body.rate,
        payment_unit: body.paymentUnit ?? 'Hour',
        flsa_status: body.flsaStatus ?? 'Nonexempt',
        effective_date: body.effectiveDate ?? '2024-12-24',
        adjust_for_minimum_wage: false,
      })
    })

    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const { result } = renderHook(
      () => useCurrentCompensationForm({ employeeId: 'employee-uuid' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.status.mode).toBe('update')
    expect(result.current.data.compensation?.uuid).toBe('compensation-uuid')
    expect(result.current.data.currentJob?.uuid).toBe('job-uuid')

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    expect(updateCompensationPath).toBe('/v1/compensations/compensation-uuid')
  })

  it("routes to the PRIMARY job's current compensation (ignores secondaries)", async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json([
          buildJob({
            uuid: 'secondary-job',
            primary: false,
            currentCompensationUuid: 'secondary-comp',
          }),
          buildJob({
            uuid: 'primary-job',
            primary: true,
            currentCompensationUuid: 'primary-comp',
          }),
        ]),
      ),
    )

    const { result } = renderHook(
      () => useCurrentCompensationForm({ employeeId: 'employee-uuid' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data.compensation?.uuid).toBe('primary-comp')
  })

  it('falls back to create mode when employee has no jobs', async () => {
    let createCompensationPath: string | null = null
    const createCompensationResolver = vi.fn(({ request }) => {
      createCompensationPath = new URL(request.url).pathname
      return HttpResponse.json(
        {
          uuid: 'new-comp-uuid',
          version: 'v1',
          job_uuid: 'newly-created-job',
          rate: '20',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          effective_date: '2099-01-01',
          adjust_for_minimum_wage: false,
        },
        { status: 201 },
      )
    })

    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateCompensation(createCompensationResolver),
    )

    const { result } = renderHook(
      () =>
        useCurrentCompensationForm({
          employeeId: 'employee-uuid',
          defaultValues: {
            flsaStatus: FlsaStatus.NONEXEMPT,
            rate: 20,
            effectiveDate: '2099-01-01',
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.status.mode).toBe('create')

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit({ jobId: 'newly-created-job' })
    })

    expect(createCompensationResolver).toHaveBeenCalledTimes(1)
    expect(createCompensationPath).toBe('/v1/jobs/newly-created-job/compensations')
  })
})
