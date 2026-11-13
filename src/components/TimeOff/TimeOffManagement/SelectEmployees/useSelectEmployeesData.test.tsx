import { Suspense, type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import { handleGetCompanyEmployees } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

describe('server-side time-off eligibility', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('requests onboarded active employees on every page and trusts server eligibility', async () => {
    const requests: URLSearchParams[] = []
    const resolver = vi.fn<HttpResponseResolver>(({ request }) => {
      const params = new URL(request.url).searchParams
      requests.push(params)
      const page = params.get('page')
      return HttpResponse.json(
        [{ uuid: `employee-${page}`, first_name: `Employee ${page}`, last_name: 'Test', jobs: [] }],
        { headers: { 'x-total-pages': '2' } },
      )
    })
    server.use(handleGetCompanyEmployees(resolver))
    const queryClient = createSdkQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GustoTestProvider queryClient={queryClient}>
        <Suspense fallback={null}>{children}</Suspense>
      </GustoTestProvider>
    )
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), {
      wrapper,
    })
    await waitFor(() => {
      expect(result.current.eligibleCount).toBe(2)
    })
    expect(resolver).toHaveBeenCalledTimes(2)
    expect(requests.map(params => params.get('page')).sort()).toEqual(['1', '2'])
    for (const params of requests) {
      expect(params.get('onboarded_active')).toBe('true')
      expect(params.get('terminated')).toBe('false')
      expect(params.get('include')).toBe('all_compensations')
    }
  })
})
