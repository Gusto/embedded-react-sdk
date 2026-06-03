import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { useHomeAddressSummary } from './useHomeAddressSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'

describe('useHomeAddressSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the active home address', async () => {
    const { result } = renderHook(() => useHomeAddressSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.currentHomeAddress).toMatchObject({ active: true })
    expect(result.current.data.employeeAddressList.length).toBeGreaterThan(0)
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('picks the active home address out of a list with inactive rows', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json([
          {
            uuid: 'home-inactive',
            version: '1',
            street_1: '1 Old St',
            city: 'Oldtown',
            state: 'CA',
            zip: '90001',
            country: 'USA',
            active: false,
          },
          {
            uuid: 'home-active',
            version: '1',
            street_1: '2 Current Ave',
            city: 'Newtown',
            state: 'CA',
            zip: '90002',
            country: 'USA',
            active: true,
          },
        ]),
      ),
    )

    const { result } = renderHook(() => useHomeAddressSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.currentHomeAddress).toMatchObject({
      uuid: 'home-active',
      active: true,
    })
    expect(result.current.data.employeeAddressList).toHaveLength(2)
  })

  it('returns undefined currentHomeAddress when no address is active', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json([]),
      ),
    )

    const { result } = renderHook(() => useHomeAddressSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.currentHomeAddress).toBeUndefined()
    expect(result.current.data.employeeAddressList).toEqual([])
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useHomeAddressSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
