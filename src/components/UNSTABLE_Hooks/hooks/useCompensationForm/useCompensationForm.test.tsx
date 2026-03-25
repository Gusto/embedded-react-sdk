import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useCompensationForm } from './useCompensationForm'
import type { UseCompensationFormResult } from './useCompensationForm'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs, handleCreateEmployeeJob } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

type ReadyResult = Extract<UseCompensationFormResult, { isLoading: false }>

function assertReady(hookResult: UseCompensationFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const VALID_DEFAULTS = {
  jobTitle: 'Software Engineer',
  rate: 50,
}

describe('useCompensationForm start date handling', () => {
  let createJobRequestBody: Record<string, unknown> | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    createJobRequestBody = null
    setupApiTestMocks()
    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateEmployeeJob(async ({ request }) => {
        createJobRequestBody = (await request.json()) as Record<string, unknown>
        const responseFixture = await getFixture('get-v1-employees-employee_id-jobs')
        return HttpResponse.json(
          {
            ...responseFixture[0],
            title: createJobRequestBody.title,
            hire_date: createJobRequestBody.hireDate,
          },
          { status: 201 },
        )
      }),
    )
  })

  it('surfaces error through errorHandling when creating a job without any start date', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          defaultValues: VALID_DEFAULTS,
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    await act(async () => {
      await readyResult.actions.onSubmit()
    })

    expect(result.current.errorHandling.errors).toHaveLength(1)
    expect(result.current.errorHandling.errors[0]?.category).toBe('internal_error')
    expect(result.current.errorHandling.errors[0]?.message).toBe('Start date is required')
    expect(createJobRequestBody).toBeNull()
  })

  it('creates a job with hireDate from options.startDate', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          defaultValues: VALID_DEFAULTS,
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    await act(async () => {
      await readyResult.actions.onSubmit({}, { startDate: '2024-06-15' })
    })

    expect(result.current.errorHandling.errors).toHaveLength(0)
    expect(createJobRequestBody).not.toBeNull()
    expect(createJobRequestBody?.hire_date).toBe('2024-06-15')
  })

  it('creates a job with hireDate from the form when withStartDateField is enabled', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          withStartDateField: true,
          defaultValues: {
            ...VALID_DEFAULTS,
            startDate: '2024-03-20',
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    await act(async () => {
      await readyResult.actions.onSubmit()
    })

    expect(result.current.errorHandling.errors).toHaveLength(0)
    expect(createJobRequestBody).not.toBeNull()
    expect(createJobRequestBody?.hire_date).toBe('2024-03-20')
  })

  it('form start date takes precedence over options.startDate', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          withStartDateField: true,
          defaultValues: {
            ...VALID_DEFAULTS,
            startDate: '2024-03-20',
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    await act(async () => {
      await readyResult.actions.onSubmit({}, { startDate: '2024-09-01' })
    })

    expect(createJobRequestBody).not.toBeNull()
    expect(createJobRequestBody?.hire_date).toBe('2024-03-20')
  })
})
