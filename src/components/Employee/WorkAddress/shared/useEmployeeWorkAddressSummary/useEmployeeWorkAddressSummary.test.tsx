import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { useEmployeeWorkAddressSummary } from './useEmployeeWorkAddressSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'

describe('useEmployeeWorkAddressSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the active work address', async () => {
    const { result } = renderHook(
      () => useEmployeeWorkAddressSummary({ employeeId: 'employee-123' }),
      { wrapper: GustoTestProvider },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.currentWorkAddress).toMatchObject({
      active: true,
      street1: '2216 Icie Villages',
      city: 'Big Delta',
      state: 'AK',
      zip: '99737',
    })
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('returns currentWorkAddress = undefined when no row is active', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json([
          {
            uuid: 'work-1',
            version: '1',
            street_1: '100 Old Way',
            city: 'Oldville',
            state: 'CA',
            zip: '90100',
            active: false,
          },
        ]),
      ),
    )

    const { result } = renderHook(
      () => useEmployeeWorkAddressSummary({ employeeId: 'employee-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return
    expect(result.current.data.currentWorkAddress).toBeUndefined()
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(
      () => useEmployeeWorkAddressSummary({ employeeId: 'employee-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    expect(result.current.isLoading).toBe(true)
  })
})
