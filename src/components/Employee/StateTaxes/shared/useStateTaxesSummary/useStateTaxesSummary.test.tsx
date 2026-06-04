import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { useStateTaxesSummary } from './useStateTaxesSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'

describe('useStateTaxesSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the state taxes list', async () => {
    const { result } = renderHook(() => useStateTaxesSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.employeeStateTaxesList.length).toBeGreaterThan(0)
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('returns an empty employeeStateTaxesList when the API returns an empty list', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, () =>
        HttpResponse.json([]),
      ),
    )

    const { result } = renderHook(() => useStateTaxesSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return
    expect(result.current.data.employeeStateTaxesList).toEqual([])
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, () =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useStateTaxesSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    expect(result.current.isLoading).toBe(true)
  })
})
