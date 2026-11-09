import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
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

const renderCompensationHistory = () =>
  renderHook(() => useCompensationHistory({ employeeId: 'employee-uuid' }), {
    wrapper: GustoTestProvider,
  })

describe('useCompensationHistory', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts loading and resolves to the per-job history', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' })),
      ),
    )

    const { result } = renderCompensationHistory()

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(result.current.data.hasMultipleJobs).toBe(true)
    expect(
      result.current.data.jobs.map(job => [job.jobId, job.jobTitle, job.entries.length]),
    ).toEqual([
      ['job-uuid', 'Software engineer', 4],
      ['job-uuid-2', 'Team lead', 2],
    ])
    expect(result.current.data.jobs[0]?.entries.map(entry => entry.status)).toEqual([
      'upcoming',
      'current',
      'past',
      'past',
    ])
  })

  it('requests all compensations so past rates are included', async () => {
    const resolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' })),
    )
    server.use(handleGetEmployeeJobs(resolver))

    const { result } = renderCompensationHistory()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Without include=all_compensations the API returns only the current
    // compensation, which would make the whole view empty of history.
    const requestUrl = new URL(resolver.mock.calls[0]![0].request.url)
    expect(requestUrl.searchParams.get('include')).toBe('all_compensations')
  })

  it('reports no jobs when the employee has none', async () => {
    server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))

    const { result } = renderCompensationHistory()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)

    expect(result.current.data).toMatchObject({ jobs: [], hasMultipleJobs: false })
  })
})
