import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useEmployeeProfileSummary } from './useEmployeeProfileSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployee } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('useEmployeeProfileSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the employee', async () => {
    const { result } = renderHook(() => useEmployeeProfileSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.employee).toMatchObject({
      firstName: 'Isom',
      lastName: 'Jaskolski',
    })
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('does not include `?include=all_compensations` in the employee fetch', async () => {
    let employeeRequestUrl: string | null = null
    server.use(
      handleGetEmployee(({ request }) => {
        employeeRequestUrl = request.url
        return HttpResponse.json({
          uuid: 'employee-123',
          first_name: 'Isom',
          last_name: 'Jaskolski',
          jobs: [],
        })
      }),
    )

    const { result } = renderHook(() => useEmployeeProfileSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(employeeRequestUrl).not.toBeNull()
    expect(employeeRequestUrl).not.toContain('all_compensations')
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetEmployee(() =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useEmployeeProfileSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    expect(result.current.isLoading).toBe(true)
  })
})
