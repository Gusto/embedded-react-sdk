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

describe('useCompensationHistory', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

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
})
