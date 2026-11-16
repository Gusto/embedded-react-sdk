import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useCompensationHistory, type UseCompensationHistoryResult } from './useCompensationHistory'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

type ReadyResult = Extract<UseCompensationHistoryResult, { isLoading: false }>

function assertReady(hookResult: UseCompensationHistoryResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('useCompensationHistory', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const statusOf = (hookResult: ReadyResult, compensationId: string) =>
    hookResult.data.jobs
      .flatMap(job => job.entries)
      .find(entry => entry.compensationId === compensationId)?.status

  it('requests every compensation and resolves to the per-job history', async () => {
    let includeParam: string | null = null
    const resolver = vi.fn<HttpResponseResolver>(({ request }) => {
      includeParam = new URL(request.url).searchParams.get('include')
      return HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' }))
    })
    server.use(handleGetEmployeeJobs(resolver))

    const { result } = renderHook(() => useCompensationHistory({ employeeId: 'employee-uuid' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(includeParam).toBe('all_compensations')
    expect(
      result.current.data.jobs.map(job => [job.jobId, job.jobTitle, job.entries.length]),
    ).toEqual([
      ['job-uuid', 'Software engineer', 4],
      ['job-uuid-2', 'Team lead', 2],
    ])
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useCompensationHistory({ employeeId: 'employee-uuid' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
  it('re-tags an upcoming rate as current once its effective date arrives', async () => {
    // Only Date is faked: the query and its MSW handler still run on real timers.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2099, 1, 28, 23, 59))

    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' })),
      ),
    )

    const { result } = renderHook(() => useCompensationHistory({ employeeId: 'employee-uuid' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(statusOf(result.current, 'compensation-upcoming')).toBe('upcoming')
    expect(statusOf(result.current, 'compensation-current')).toBe('current')

    vi.setSystemTime(new Date(2099, 2, 1, 0, 0, 1))
    act(() => {
      window.dispatchEvent(new Event('focus'))
    })

    expect(statusOf(result.current, 'compensation-upcoming')).toBe('current')
    expect(statusOf(result.current, 'compensation-current')).toBe('past')
  })
})
